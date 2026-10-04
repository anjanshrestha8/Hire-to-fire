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
import { Building2, Mail, Lock, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import officeHero from "@/assets/businessman-his-office-with-pilot-hat.jpg";
import axios from "axios";
import { toast } from "sonner";
import Roles from "@/constants/role.constant";
import { BASE_URL } from "@/constants/api.constant";

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  // phoneNumber: string;
  role: string;
  status: string;
  phoneNumber: string;
  designation_id: string;
  department_id: string;
}

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      return toast.error("Passwords don't match", {
        position: "top-right",
        duration: 3000,
      });
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/user/register`, {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        // phoneNumber:'1234567890',
        role: data.role,
        status: data.status,
        phoneNumber: data.phoneNumber,
        designation_id: data.designation_id,
        department_id: data.department_id,
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("Registration successful!", {
          position: "top-right",
          duration: 3000,
        });
        console.log(res.data);

        const userData = res.data;

        if (userData.role === Roles.ADMIN) {
          navigate("/");
        } else if (userData.role === Roles.EMPLOYEE) {
          navigate("/task");
        } else if (userData.role === Roles.HR_MANAGER) {
          navigate("/");
        }
      } else {
        toast.error("Registration failed. Please try again.", {
          position: "top-right",
          duration: 3000,
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data?.message || error.message);
        return toast.error(
          error.response?.data?.message || "An error occurred",
          {
            position: "top-right",
            duration: 3000,
          }
        );
      } else {
        console.log(error);
        return toast.error("An unexpected error occurred", {
          position: "top-right",
          duration: 3000,
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={officeHero}
          alt="Office Management System"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-primary opacity-80"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Join ITOfficeSystem</h1>
            <p className="text-xl text-white/90 max-w-md mx-auto">
              Register to access our comprehensive office management platform
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-secondary/30">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-elegant">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center lg:hidden">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Create Account
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Register for access to the office management system
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="first_name"
                        {...register("first_name", {
                          required: "First name is required",
                        })}
                        className="pl-10"
                        placeholder="First name"
                      />
                    </div>
                    {errors.first_name && (
                      <p className="text-sm text-destructive">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="last_name"
                        {...register("last_name", {
                          required: "Last name is required",
                        })}
                        className="pl-10"
                        placeholder="Last name"
                      />
                    </div>
                    {errors.last_name && (
                      <p className="text-sm text-destructive">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      {...register("email", { required: "Email is required" })}
                      className="pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      {...register("password", {
                        required: "Password is required",
                      })}
                      className="pl-10"
                      placeholder="Create a password"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                      })}
                      className="pl-10"
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="phoneNumber"
                      type="tel"
                      {...register("phoneNumber", {
                        required: "Phone number is required",
                      })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <Label htmlFor="designation_id">Designation</Label>
                  <Select
                    onValueChange={(value) => setValue("designation_id", value)}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Manager</SelectItem>
                      <SelectItem value="2">Team Lead</SelectItem>
                      <SelectItem value="3">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.designation_id && (
                    <p className="text-sm text-destructive">
                      Please select a designation
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department_id">Department</Label>
                  <Select
                    onValueChange={(value) => setValue("department_id", value)}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">HR</SelectItem>
                      <SelectItem value="2">IT</SelectItem>
                      <SelectItem value="3">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.department_id && (
                    <p className="text-sm text-destructive">
                      Please select a department
                    </p>
                  )}
                </div>
                {/* <div className="space-y-2">
  <Label htmlFor="phoneNumber">Phone Number</Label>
  <div className="relative">
    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input
      id="phoneNumber"
      type="tel"
      {...register("phoneNumber", {
        required: "Phone number is required",
        pattern: {
          value: /^[0-9]{10}$/,
          message: "Enter a valid 10-digit number",
        },
      })}
      className="pl-10"
      placeholder="1234567890"
    />
  </div>
  {errors.phoneNumber && (
    <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
  )}
</div> */}

                {/* Role Select */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    onValueChange={(value) => setValue("role", value)}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-100">
                      <SelectItem value="admin">{Roles.ADMIN}</SelectItem>
                      <SelectItem value="employee">{Roles.EMPLOYEE}</SelectItem>
                      <SelectItem value="manager">
                        {Roles.HR_MANAGER}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive">
                      Please select a role
                    </p>
                  )}
                </div>

                {/* Status Select */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) => setValue("status", value)}
                    defaultValue="active"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-400 hover:opacity-90 transition-smooth shadow-elegant"
                >
                  Create Account
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
