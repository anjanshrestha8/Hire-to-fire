import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppSidebar } from "./AppSidebar";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  padding?: string;
  maxWidth?: string;
  spacing?: string;
}

export function Layout({
  children,
  padding = "p-8",
  maxWidth = "max-w-7xl",
  spacing = "space-y-6",
}: LayoutProps) {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const currentUser = user?.first_name || "U";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary/30">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <header
            className="h-16 flex items-center justify-between px-6 shadow-md"
            style={{ backgroundColor: "oklch(80.9% 0.105 251.813)" }}
          >
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white hover:scale-105 transition-transform" />
              <h1 className="text-lg font-bold text-white tracking-wide">
                WORK FUSION
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Settings Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 rounded-xl transition"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-9 w-9 rounded-full bg-white/20 text-white font-bold flex items-center justify-center hover:bg-white/30 transition">
                    {currentUser.charAt(0).toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white shadow-lg rounded-xl p-2"
                  align="end"
                  forceMount
                >
                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 rounded-md flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-600" />
                    Profile Settings
                  </DropdownMenuItem>
                  <Link to={"/login"}>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                      onClick={() => {
                        localStorage.clear();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content with Flexible Spacing */}
          <main className={`flex-1 ${padding} overflow-auto`}>
            <div className={`${maxWidth} mx-auto ${spacing}`}>{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
