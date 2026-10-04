import { RoleType } from "@/constants/role.constant";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface IUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  role: RoleType;
  status: string;
  password_hash: string;
  createdAt: string;
  updatedAt: string;
}

interface ICreateContext {
  user: IUser | null;
  setUser: (user: IUser) => void | null;
}

const AuthContext = createContext<ICreateContext | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<IUser | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const setUser = (nextUser: IUser) => {
    setUserState(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
