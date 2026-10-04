import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import axiosInstanace from "@/Interceptor/axiosInstance";
import Roles from "@/constants/role.constant";
import { BASE_URL } from "@/constants/api.constant";
import { useAuth } from "@/Context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axiosInstanace.post("/api/user/login", {
        email: email,
        password: password,
      });
      const accessToken = res.data.token;
      const userData = res.data.user;
      localStorage.setItem("accessToken", accessToken);
      console.log(accessToken);
      console.log(userData);

      setUser(userData);

      if (userData.role === Roles.SUPER_ADMIN || userData.role === Roles.ADMIN) {
        navigate("/");
      } else if (userData.role === Roles.EMPLOYEE) {
        navigate("/tasks");
      } else if (userData.role === Roles.HR_MANAGER) {
        navigate("/");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setIsLoading(false);
        return toast.error(error.response?.data.message);
      }
      setIsLoading(false);
      return toast.error("Unknown Error");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* <img
          src={officeHero}
          alt="Office Management System"
          className="w-full h-full object-cover"
        /> */}
        <div className="absolute inset-0 bg-gradient-primary opacity-80"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">ITOfficeSystem</h1>
            <p className="text-xl text-white/90 max-w-md mx-auto">
              Streamline your office operations with our comprehensive
              management platform
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-secondary/30">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-elegant">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center lg:hidden">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to access your office management dashboard
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <a href="#" className="text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <Button onClick={handleGoogleLogin}>Login with Google</Button>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Need access?{" "}
                <a href="#" className="text-primary hover:underline">
                  Contact your administrator
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
