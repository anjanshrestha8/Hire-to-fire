import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ArrowUpRight, UserCheck, Users } from "lucide-react";
import { BASE_URL } from "@/constants/api.constant";

type Department = {
  id: number;
  name: string;
  description?: string;
  manager?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  status: string;
  createdAt: string;
  employeeCount?: number;
};

type Manager = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

const DEPARTMENTS_QUERY_KEY = ["departments"] as const;
const MANAGERS_QUERY_KEY = ["managers"] as const;

async function fetchDepartments(): Promise<Department[]> {
  const res = await axios.get(`${BASE_URL}/api/department/department`);
  return res.data.departments || [];
}

async function fetchManagers(): Promise<Manager[]> {
  const res = await axios.get(`${BASE_URL}/api/employee/employee`);
  return (res.data.users || []).filter(
    (emp: Manager) => emp.role.toLowerCase() === "manager"
  );
}

export default function Departments() {
  const queryClient = useQueryClient();
  const {
    data: departments = [],
    isLoading: loading,
  } = useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchDepartments();
      } catch {
        toast.error("Failed to load departments.");
        throw new Error("Failed to load departments");
      }
    },
  });
  const {
    data: managers = [],
    isLoading: managerLoading,
  } = useQuery({
    queryKey: MANAGERS_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchManagers();
      } catch {
        toast.error("Failed to load managers.");
        throw new Error("Failed to load managers");
      }
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.manager_id) {
      toast.error("Please select a manager.");
      return;
    }
    try {
      setAdding(true);
      await axios.post(`${BASE_URL}/api/department/adddepartment`, {
        name: formData.name,
        description: formData.description,
        manager_id: formData.manager_id,
      });
      toast.success("Department added successfully!");
      setIsDialogOpen(false);
      setFormData({ name: "", description: "", manager_id: "" });
      await queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || "Failed to add department");
      } else {
        toast.error("Failed to add department");
      }
    } finally {
      setAdding(false);
    }
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dept.manager &&
        `${dept.manager.first_name} ${dept.manager.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-300";
      case "inactive":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const activeDepartments = departments.filter(
    (dept) => dept.status === "active"
  ).length;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 bg-clip-text text-transparent">
              Departments
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage organizational departments and structure
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-64 rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg rounded-2xl bg-white shadow-2xl border-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent">
                      Add New Department
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 text-base">
                      Fill in the details to create a new department.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold text-gray-700 mb-2 block"
                      >
                        Department Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Human Resources"
                        className="rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="manager"
                        className="text-sm font-semibold text-gray-700 mb-2 block"
                      >
                        Manager
                      </Label>
                      {managerLoading ? (
                        <div className="flex items-center text-sm text-gray-500 p-3 bg-sky-50 rounded-xl">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-sky-500" />
                          Loading managers...
                        </div>
                      ) : (
                        <select
                          id="manager"
                          className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 p-3 bg-white"
                          value={formData.manager_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              manager_id: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Manager</option>
                          {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                              {manager.first_name} {manager.last_name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="description"
                        className="text-sm font-semibold text-gray-700 mb-2 block"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief description of the department"
                        className="rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={adding}
                      className="bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
                    >
                      {adding && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Department
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 bg-gradient-to-br from-sky-50 to-sky-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase">
                      Total Departments
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {departments.length}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-500">
                        +12%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 bg-sky-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase">
                      Active Departments
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {activeDepartments}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-500">
                        +8%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-500 shadow-lg">
                    <UserCheck className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              <p className="text-gray-600">Loading departments...</p>
            </div>
          </div>
        ) : filteredDepartments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((dept) => (
              <Card
                key={dept.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
              >
                <CardHeader className="bg-gradient-to-r from-sky-50 to-sky-100 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-sky-700 group-hover:text-sky-800 transition-colors">
                        {dept.name}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mt-1 flex items-center">
                        <Users className="w-4 h-4 mr-1 text-sky-500" />
                        Manager:{" "}
                        {dept.manager
                          ? `${dept.manager.first_name} ${dept.manager.last_name}`
                          : "N/A"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/50 rounded-xl"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl border-0 shadow-xl bg-white"
                      >
                        <DropdownMenuItem className="cursor-pointer hover:bg-sky-50 rounded-lg">
                          <Edit className="w-4 h-4 mr-2 text-sky-600" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    {dept.description || "No description provided"}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge
                      className={`${getStatusColor(
                        dept.status
                      )} rounded-full px-3 py-1 font-semibold border-0`}
                    >
                      {dept.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Created</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {new Date(dept.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="text-center py-12">
              <div className="p-4 bg-sky-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No departments found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or add a new department.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Department
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
