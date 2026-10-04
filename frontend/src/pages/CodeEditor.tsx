import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Share,
  Settings,
  FileText,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/Layout";
import Editor from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { BASE_URL } from "@/constants/api.constant";

type FileItem = {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileItem[];
};

type Branch = {
  name: string;
};

type User = {
  id: string;
  name: string;
  color: string;
  initials: string;
};

type GitHubContentItem = {
  name: string;
  path: string;
  type: string;
};

const socket: Socket = io(BASE_URL);

export default function CodeEditorPage() {
  const [repoUrl, setRepoUrl] = useState<string>(
    localStorage.getItem("repoUrl") || ""
  );
  const [fileStructure, setFileStructure] = useState<FileItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeFile, setActiveFile] = useState<string>("");
  const [content, setContent] = useState<string>("// Start coding...");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("main");
  const [loading, setLoading] = useState<boolean>(
    () => Boolean(localStorage.getItem("repoUrl"))
  );

  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);

  /** ✅ Fetch repo files recursively */
  const fetchRepoFiles = async (
    owner: string,
    repo: string,
    path = ""
  ): Promise<FileItem[]> => {
    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${selectedBranch}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) return [];

      return Promise.all(
        data.map(async (item: GitHubContentItem) => {
          if (item.type === "dir") {
            return {
              name: item.name,
              path: item.path,
              type: "folder" as const,
              children: await fetchRepoFiles(owner, repo, item.path),
            };
          } else {
            return {
              name: item.name,
              path: item.path,
              type: "file" as const,
            };
          }
        })
      );
    } catch (error) {
      console.error("Error fetching repo files:", error);
      return [];
    }
  };

  /** ✅ Fetch branches whenever repo URL changes */
  useEffect(() => {
    if (!repoUrl) return;

    const [owner, repo] = repoUrl.replace("https://github.com/", "").split("/");
    if (!owner || !repo) return;

    let cancelled = false;
    fetch(`https://api.github.com/repos/${owner}/${repo}/branches`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        setBranches(data);
        setSelectedBranch(data[0]?.name || "main");
      })
      .catch((err) => console.error("Error fetching branches:", err));

    return () => {
      cancelled = true;
    };
  }, [repoUrl]);

  /** ✅ Load repo and save in localStorage */
  const handleLoadRepo = async (opts?: { showLoading?: boolean }) => {
    if (!repoUrl.trim()) {
      toast.error("Please enter a valid GitHub repository URL.");
      return;
    }

    try {
      if (opts?.showLoading !== false) setLoading(true);
      const [owner, repo] = repoUrl
        .replace("https://github.com/", "")
        .split("/");
      if (!owner || !repo) {
        toast.error("Invalid GitHub URL format.");
        setLoading(false);
        return;
      }

      const files = await fetchRepoFiles(owner, repo);
      localStorage.setItem("repoUrl", repoUrl);
      setFileStructure(files);
    } catch (err) {
      console.error("Failed to fetch repo:", err);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Handle File Click */
  const handleFileClick = async (file: FileItem) => {
    setActiveFile(file.path);
    if (file.type !== "file") return;

    try {
      const [owner, repo] = repoUrl
        .replace("https://github.com/", "")
        .split("/");
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${selectedBranch}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      const code = data.content
        ? decodeURIComponent(
            escape(window.atob(data.content.replace(/\n/g, "")))
          )
        : "";

      setContent(code);
      socket.emit("codeChange", code);
    } catch (err) {
      console.error("Failed to load file content:", err);
      setContent("// Unable to load file");
    }
  };

  /** ✅ Toggle folder open/close */
  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  /** ✅ Render File Tree */
  const renderFileTree = (items: FileItem[], level = 0): React.ReactElement[] =>
    items.map((item, index) => (
      <div key={index} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-muted/50 rounded cursor-pointer text-sm ${
            activeFile === item.path ? "bg-muted font-medium" : ""
          }`}
          onClick={() =>
            item.type === "folder"
              ? toggleFolder(item.path)
              : handleFileClick(item)
          }
        >
          {item.type === "folder" ? (
            <>
              {expandedFolders[item.path] ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              <FolderOpen className="w-4 h-4 text-blue-600" />
            </>
          ) : (
            <>
              <div className="w-3 h-3" />
              <FileText className="w-4 h-4 text-gray-600" />
            </>
          )}
          <span>{item.name}</span>
        </div>
        {item.type === "folder" &&
          expandedFolders[item.path] &&
          item.children &&
          renderFileTree(item.children, level + 1)}
      </div>
    ));

  /** ✅ Monaco Editor setup */
  const handleEditorDidMount = (
    editor: MonacoEditor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      setContent(value);
      socket.emit("codeChange", value);
    });

    const currentUser: User = JSON.parse(
      localStorage.getItem("currentUser") ||
        '{"id":"0","name":"Me","color":"bg-green-500","initials":"M"}'
    );

    editor.onDidChangeCursorPosition(
      (e: MonacoEditor.ICursorPositionChangedEvent) => {
        socket.emit("cursorChange", {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
          userId: currentUser.id,
        });
      }
    );
  };

  /** ✅ Remote cursor handling */
  const [remoteCursors, setRemoteCursors] = useState<{
    [id: string]: { lineNumber: number; column: number };
  }>({});

  useEffect(() => {
    socket.on("initDocument", (doc: string) => setContent(doc));
    socket.on("updateCode", (newCode: string) => {
      setContent(newCode);
      editorRef.current?.getModel()?.setValue(newCode);
    });
    socket.on(
      "updateCursor",
      ({
        id,
        lineNumber,
        column,
      }: {
        id: string;
        lineNumber: number;
        column: number;
      }) =>
        setRemoteCursors((prev) => ({
          ...prev,
          [id]: { lineNumber, column },
        }))
    );
    socket.on("removeCursor", (id: string) => {
      setRemoteCursors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });

    return () => {
      socket.off("initDocument");
      socket.off("updateCode");
      socket.off("updateCursor");
      socket.off("removeCursor");
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    const decorations = Object.values(remoteCursors).map((pos) => ({
      range: {
        startLineNumber: pos.lineNumber,
        startColumn: pos.column,
        endLineNumber: pos.lineNumber,
        endColumn: pos.column + 1,
      },
      options: {
        className: "remote-cursor",
      },
    }));
    editorRef.current.deltaDecorations([], decorations);
  }, [remoteCursors]);

  useEffect(() => {
    if (!repoUrl || fileStructure.length > 0) return;

    let cancelled = false;
    (async () => {
      // Yield so any setState runs in a microtask, not sync inside the effect
      await Promise.resolve();
      if (cancelled) return;

      try {
        const [owner, repo] = repoUrl
          .replace("https://github.com/", "")
          .split("/");
        if (!owner || !repo) return;

        const files = await fetchRepoFiles(owner, repo);
        if (cancelled) return;

        localStorage.setItem("repoUrl", repoUrl);
        setFileStructure(files);
      } catch (err) {
        console.error("Failed to fetch repo:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Initial hydrate from stored repo URL only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoUrl]);

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* File Explorer */}
        <div className="w-64 border-r border-gray-200 p-2 bg-gray-50 flex flex-col">
          <div className="p-2">
            <div className="relative mb-2 flex gap-2">
              <Input
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="pl-2 text-sm h-8 flex-1"
              />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="border px-2 py-1"
              >
                {branches.map((branch) => (
                  <option key={branch.name} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                type="button"
                onClick={() => void handleLoadRepo()}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load"}
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                EXPLORER
              </div>
              {renderFileTree(fileStructure)}
            </ScrollArea>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 bg-white">
            <span className="text-sm font-medium text-gray-700">
              Collaborative Editor
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8">
                <Play className="w-4 h-4 mr-1" /> Run
              </Button>
              <Button size="sm" variant="outline" className="h-8">
                <Share className="w-4 h-4 mr-1" /> Share
              </Button>
              <Button size="sm" variant="ghost" className="h-8">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Editor
            height="90vh"
            language={
              activeFile.endsWith(".ts") || activeFile.endsWith(".tsx")
                ? "typescript"
                : "javascript"
            }
            theme="vs-dark"
            value={content}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />

          <div className="flex items-center gap-2 border-t border-gray-200 px-4 py-2 bg-gray-50">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium bg-green-500">
              M
            </div>
            {Object.entries(remoteCursors).map(([id]) => (
              <div
                key={id}
                className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-medium"
              >
                {id}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </Layout>
  );
}
