import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  MessageSquare,
  Video,
  Code,
  Building2,
  Briefcase,
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
    icon: Users,
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
    icon: Briefcase,
    allowedRoles: [Roles.ADMIN, Roles.HR_MANAGER],
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
    allowedRoles: [Roles.ADMIN, Roles.EMPLOYEE, Roles.HR_MANAGER],
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
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
    icon: Code,
    allowedRoles: [Roles.ADMIN, Roles.EMPLOYEE],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();

  return (
    <Sidebar
      className={`transition-all duration-300 ${
        state === "collapsed" ? "w-20" : "w-64"
      } shadow-lg text-white`}
      style={{ backgroundColor: "oklch(80.9% 0.105 251.813)" }}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-8 border-b border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {state !== "collapsed" && (
              <div>
                <h2 className="text-lg font-bold text-black">Work Fusion</h2>
                {/* <p className="text-xs text-white/70">Management System</p> */}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          {state !== "collapsed" && (
            <SidebarGroupLabel className="px-6 py-2 text-xs font-semibold text-white/60 uppercase tracking-wide">
              Navigation
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent className="px-4 py-2">
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
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                          isActive
                            ? "bg-white/20 shadow-md text-white scale-[1.02]"
                            : "text-white/70 hover:text-white hover:bg-black/20"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <div className="mt-auto px-4 py-4 border-t border-white/20">
        {state !== "collapsed" && (
          <p className="text-xs text-white/60">© 2025 Work Fusion</p>
        )}
      </div>
    </Sidebar>
  );
}
