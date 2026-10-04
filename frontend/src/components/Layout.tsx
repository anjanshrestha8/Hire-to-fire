import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Settings, LogOut, Search, Bell, ChevronDown } from "lucide-react";
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
      <div
        className="min-h-screen flex w-full bg-[#e8eef5]"
        style={{
          fontFamily:
            '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header
            className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-white"
            style={{ padding: "0 16px" }}
          >
            {/* Left: menu + brand */}
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span
                aria-hidden
                className="h-5 w-px bg-[#d0d8e4]"
              />
              <h1
                className="text-[1.05rem] font-semibold text-[#16325c]"
                style={{ letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                Work Fusion
              </h1>
            </div>

            {/* Right: search + actions + profile */}
            <div className="flex items-center gap-3">
              <label
                className="relative hidden items-center sm:flex"
                style={{ minWidth: 240 }}
              >
                <Search
                  className="pointer-events-none absolute left-3 h-4 w-4 text-[#7b8da6]"
                  strokeWidth={1.75}
                />
                <input
                  type="search"
                  placeholder="Search anything..."
                  className="h-10 w-full rounded-full border border-[#dbe3ee] bg-white pl-9 pr-4 text-sm text-[#16325c] outline-none transition placeholder:text-[#9aabc0] focus:border-[#93c5fd] focus:ring-2 focus:ring-[#93c5fd]/35"
                />
              </label>

              <button
                type="button"
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-[8px] text-[#16325c] transition hover:bg-[#eef3f9]"
              >
                <Bell className="h-5 w-5" strokeWidth={1.75} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-white" />
              </button>

              <button
                type="button"
                aria-label="Settings"
                className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#16325c] transition hover:bg-[#eef3f9]"
              >
                <Settings className="h-5 w-5" strokeWidth={1.75} />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-[8px] py-1.5 pl-1.5 pr-2 transition hover:bg-[#eef3f9]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dbeafe] text-sm font-semibold text-[#16325c]">
                      {currentUser.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden text-sm font-medium text-[#16325c] md:inline">
                      {currentUser}
                    </span>
                    <ChevronDown
                      className="hidden h-4 w-4 text-[#16325c] md:inline"
                      strokeWidth={1.75}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-xl bg-white p-2 shadow-lg"
                  align="end"
                  forceMount
                >
                  <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-md hover:bg-gray-100">
                    <Settings className="h-4 w-4 text-gray-600" />
                    Profile Settings
                  </DropdownMenuItem>
                  <Link to={"/login"}>
                    <DropdownMenuItem
                      className="flex cursor-pointer items-center gap-2 rounded-md text-red-600 hover:bg-red-50"
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

          <main className={`flex-1 ${padding} overflow-auto`}>
            <div className={`${maxWidth} mx-auto ${spacing}`}>{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
