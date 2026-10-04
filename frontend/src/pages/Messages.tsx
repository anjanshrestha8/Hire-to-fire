import { useEffect, useState, useRef } from "react";
import { socket } from "../lib/socket";
import axiosInstance from "@/Interceptor/axiosInstance";
import { formatDistanceToNow } from "date-fns";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";

interface Channel {
  id: number;
  name: string;
}
interface Message {
  id: string;
  room: string;
  sender: string;
  content: string;
  createdAt: string;
}

export default function Chat() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  const [editingChannelId, setEditingChannelId] = useState<number | null>(null);
  const [editingChannelName, setEditingChannelName] = useState("");

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const currentUser = user?.first_name;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    axiosInstance
      .get("/channel")
      .then((res) => setChannels(res.data))
      .catch(console.log);

    socket.on("channel-created", (c: Channel) =>
      setChannels((prev) => [...prev, c])
    );
    socket.on("channel-renamed", (c: Channel) =>
      setChannels((prev) => prev.map((p) => (p.id === c.id ? c : p)))
    );
    socket.on("channel-deleted", (id: number) =>
      setChannels((prev) => prev.filter((p) => p.id !== id))
    );

    return () => {
      socket.off("channel-created");
      socket.off("channel-renamed");
      socket.off("channel-deleted");
    };
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;

    socket.emit("joinRoom", selectedChannel.id);

    const onReceive = (msg: Message) => setMessages((prev) => [...prev, msg]);
    const onEdited = (updated: Message) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    const onDeleted = (id: string) =>
      setMessages((prev) => prev.filter((m) => m.id !== id));

    socket.on("receiveMessage", onReceive);
    socket.on("message-edited", onEdited);
    socket.on("message-deleted", onDeleted);

    axiosInstance
      .get(`/api/message/${selectedChannel.id}`)
      .then((res) => setMessages(res.data))
      .catch(console.log);

    return () => {
      socket.off("receiveMessage", onReceive);
      socket.off("message-edited", onEdited);
      socket.off("message-deleted", onDeleted);
    };
  }, [selectedChannel]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;
    try {
      const res = await axiosInstance.post("/api/message", {
        roomId: selectedChannel.id,
        sender: currentUser,
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      socket.emit("send-message", {
        room: selectedChannel.id,
        message: res.data,
      });
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  const startEditingMessage = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditingContent(msg.content);
  };

  const saveEditMessage = async (id: string) => {
    if (!editingContent.trim()) return;
    try {
      const res = await axiosInstance.put(`/api/message/${id}`, {
        content: editingContent,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: res.data.content } : m))
      );
      socket.emit("edit-message", {
        room: selectedChannel?.id,
        id,
        content: editingContent,
      });
      setEditingMessageId(null);
      setEditingContent("");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await axiosInstance.delete(`/api/message/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      socket.emit("delete-message", { room: selectedChannel?.id, id });
    } catch (err) {
      console.error(err);
    }
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      const res = await axiosInstance.post("/channel", {
        name: newChannelName,
      });
      setChannels((prev) => [...prev, res.data]);
      socket.emit("channel-created", res.data);
      setNewChannelName("");
      setIsModalOpen(false);
      toast("Channel added successfully");
    } catch (err) {
      console.error(err);
      toast(`Failed to create the channel ${err}`);
    }
  };

  const startEditingChannel = (channel: Channel) => {
    setEditingChannelId(channel.id);
    setEditingChannelName(channel.name);
  };

  const saveEditChannel = async (id: number) => {
    if (!editingChannelName.trim()) return;
    try {
      const res = await axiosInstance.put(`/api/channel/${id}`, {
        name: editingChannelName,
      });
      setChannels((prev) => prev.map((c) => (c.id === id ? res.data : c)));
      socket.emit("channel-renamed", res.data);
      setEditingChannelId(null);
      setEditingChannelName("");
      toast("Channel updated successfully");
    } catch (err) {
      console.error(err);
      toast("Failed to update channel");
    }
  };

  const deleteChannel = async (id: number) => {
    try {
      await axiosInstance.delete(`/api/channel/${id}`);
      setChannels((prev) => prev.filter((c) => c.id !== id));
      socket.emit("channel-deleted", id);
      if (selectedChannel?.id === id) setSelectedChannel(null);
      toast("Channel deleted successfully");
    } catch (err) {
      console.error(err);
      toast("Failed to delete channel");
    }
  };

  return (
    <Layout>
      <div className="flex h-[85vh] font-sans bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl">
          {/* Header */}
          <div className="bg-black text-white p-4 font-semibold rounded-t">
            Realtime Chat
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`group flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedChannel?.id === channel.id
                    ? "bg-gray-200 text-gray-900 shadow-lg transform scale-[1.02]"
                    : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div
                  onClick={() => setSelectedChannel(channel)}
                  className="flex items-center gap-3 flex-1"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedChannel?.id === channel.id
                        ? "bg-gray-700 dark:bg-gray-300"
                        : "bg-gray-400 dark:bg-gray-500"
                    }`}
                  />
                  <span className="font-medium truncate">{channel.name}</span>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditingChannel(channel)}
                    className="p-1 hover:bg-white/20 rounded-md transition-colors"
                    title="Edit channel"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteChannel(channel.id)}
                    className="p-1 hover:bg-red-500/20 rounded-md transition-colors text-red-500"
                    title="Delete channel"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Channel Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full p-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              + New Channel
            </button>
          </div>
        </div>

        {/* Chat Area */}
        {selectedChannel ? (
          <div className="flex-1 flex flex-col bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm min-h-0">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  #{selectedChannel.name}
                </h2>
                <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                  {messages.length} messages
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === currentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] sm:max-w-md ${
                      msg.sender === currentUser ? "ml-auto text-right" : ""
                    }`}
                  >
                    {editingMessageId === msg.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={() => saveEditMessage(msg.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="group">
                        <div
                          className={`inline-block px-5 py-3 rounded-2xl shadow-md backdrop-blur-sm transition-all duration-200 break-words ${
                            msg.sender === currentUser
                              ? "bg-gray-200 text-gray-900 ml-auto"
                              : "bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          {msg.content}
                        </div>

                        <div
                          className={`flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400 ${
                            msg.sender === currentUser
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <span className="font-medium text-gray-600 dark:text-gray-300">
                            {msg.sender}
                          </span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(msg.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {msg.sender === currentUser && (
                          <div className="flex gap-3 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            <button
                              onClick={() => startEditingMessage(msg)}
                              className="text-blue-500 hover:text-blue-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="text-red-500 hover:text-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={`Message #${selectedChannel.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-900 dark:text-gray-200 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Please select channel
              </h3>
            </div>
          </div>
        )}

        {/* Modals */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                Create New Channel
              </h2>
              <input
                type="text"
                placeholder="Enter channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter") createChannel();
                }}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createChannel}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl transition-all duration-200"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {editingChannelId !== null && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                Edit Channel
              </h2>
              <input
                type="text"
                placeholder="Enter channel name"
                value={editingChannelName}
                onChange={(e) => setEditingChannelName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && editingChannelId)
                    saveEditChannel(editingChannelId);
                }}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingChannelId(null)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    editingChannelId && saveEditChannel(editingChannelId)
                  }
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl transition-all duration-200"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
