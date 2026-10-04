import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UsersRound,
  Building2,
  BadgeCheck,
  ListTodo,
  MessagesSquare,
  Video,
  Braces,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Roles from "@/constants/role.constant";
import { hasAccess } from "@/utils/access";
import { useAuth } from "@/Context/AuthContext";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    allowedRoles: [Roles.ADMIN, Roles.HR_MANAGER],
  },
  {
    title: "Employees",
    url: "/employees",
    icon: UsersRound,
    allowedRoles: [Roles.ADMIN, Roles.HR_MANAGER],
  },
  {
    title: "Departments",
    url: "/departments",
    icon: Building2,
    allowedRoles: [Roles.ADMIN, Roles.HR_MANAGER],
  },
  {
    title: "Designations",
    url: "/designations",
    icon: BadgeCheck,
    allowedRoles: [Roles.ADMIN, Roles.HR_MANAGER],
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ListTodo,
    allowedRoles: [Roles.ADMIN, Roles.EMPLOYEE, Roles.HR_MANAGER],
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessagesSquare,
    allowedRoles: [Roles.ADMIN, Roles.EMPLOYEE],
  },
  {
    title: "Video Calls",
    url: "/video",
    icon: Video,
    allowedRoles: [Roles.ADMIN, Roles.EMPLOYEE],
  },
  {
    title: "Code Editor",
    url: "/code-editor",
    icon: Braces,
    allowedRoles: [Roles.ADMIN, Roles.EMPLOYEE],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className={`app-sidebar flex flex-col text-[#e8eef6] shadow-2xl transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      style={{
        background:
          "radial-gradient(120% 80% at 0% 0%, #16324f 0%, transparent 55%), linear-gradient(180deg, #0a1628 0%, #0d1f33 48%, #0b1829 100%)",
        fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
      }}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Logo */}
        <div
          className={`${isCollapsed ? "pb-6" : "pb-4"}`}
          style={
            isCollapsed
              ? { paddingLeft: 8, paddingRight: 8, marginTop: 16 }
              : { paddingLeft: 16, paddingRight: 16, marginTop: 16 }
          }
        >
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-2"
            }`}
            style={{ minHeight: 44 }}
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-[#38bdf8]/30 blur-md"
              />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#38bdf8] to-[#0ea5e9] shadow-[0_8px_24px_rgba(14,165,233,0.35)]">
                <Users className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
            </div>
            {!isCollapsed && (
              <h2
                className="text-[1.125rem] font-semibold text-white"
                style={{
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                Work Fusion
              </h2>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel
              className="pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6b849e]"
              style={{ paddingLeft: 16, paddingRight: 16 }}
            >
              Navigation
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent
            className="pb-2"
            style={
              isCollapsed
                ? { paddingLeft: 8, paddingRight: 8 }
                : { paddingLeft: 16, paddingRight: 16 }
            }
          >
            <SidebarMenu>
              {navigationItems
                .filter(
                  (item) =>
                    !!user?.role && hasAccess(user.role, item.allowedRoles)
                )
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink
                      to={item.url}
                      end
                      style={{
                        padding: isCollapsed ? "18px 8px" : "4px 16px",
                        gap: 8,
                        borderRadius: 8,
                      }}
                      className={({ isActive }) =>
                        `group flex items-center text-[13.5px] tracking-[-0.01em] transition-all duration-200 ${
                          isCollapsed ? "justify-center" : ""
                        } ${
                          isActive
                            ? "bg-[#1d9bf0] font-semibold text-white shadow-[0_10px_24px_rgba(29,155,240,0.32)]"
                            : "font-medium text-[#a8b9cc] hover:bg-[#15263a] hover:text-[#f1f5f9]"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                              isActive
                                ? "text-white"
                                : "text-[#7f95ad] group-hover:text-[#dbe7f3]"
                            }`}
                            strokeWidth={isActive ? 2.25 : 1.75}
                            fill={isActive ? "currentColor" : "none"}
                            fillOpacity={isActive ? 0.18 : 0}
                          />
                          {!isCollapsed && <span>{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div
        className={`mt-auto border-t border-white/5 pb-5 pt-4 ${
          isCollapsed ? "px-2" : "px-5"
        }`}
      >
        {!isCollapsed ? (
          <p className="text-center text-[11px] font-medium tracking-wide text-[#5f758c]">
            © {new Date().getFullYear()} Work Fusion
          </p>
        ) : (
          <div className="mx-auto h-1.5 w-1.5 rounded-full bg-[#38bdf8]/50" />
        )}
      </div>
    </Sidebar>
  );
}
