import { useAuth } from "@/Context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to={"/login"} />;

  console.log(allowedRoles.includes(user.role));

  if (!allowedRoles.includes(user.role)) {
    console.log("yesma gako ho?");
    return <Navigate to="/register" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
