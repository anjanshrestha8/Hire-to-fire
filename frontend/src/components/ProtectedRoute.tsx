import { useAuth } from "@/Context/AuthContext";
import { RoleType } from "@/constants/role.constant";
import { hasAccess } from "@/utils/access";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: RoleType[] }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to={"/login"} />;

  if (!hasAccess(user.role, allowedRoles)) {
    return <Navigate to="/register" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
