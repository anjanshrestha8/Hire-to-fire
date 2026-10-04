import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  // Filter,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Building,
  UserCheck,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { BASE_URL } from "@/constants/api.constant";

type Designation = {
  id: number;
  title: string;
  department: string;
  description: string;
  level: string;
  status: string;
  employees: number;
  salaryRange: string;
  created: string;
};

// API configuration - Updated to match your backend
const API_BASE_URL = `${BASE_URL}/api/designation`;

// API functions
const api = {
  // Fetch all designations
  getDesignations: async (): Promise<Designation[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/getdesignation`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching designations:", error);
      throw error;
    }
  },

  // Create new designation
  createDesignation: async (designation: {
    title: string;
    description: string;
    department: string;
    level: string;
    salaryMin: string;
    salaryMax: string;
  }): Promise<{
    designation: Designation & {
      salary_range?: string;
      created_at?: string;
    };
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/adddesignation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(designation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating designation:", error);
      throw error;
    }
  },

  // Update designation
  updateDesignation: async (
    id: number,
    designation: {
      title: string;
      description: string;
      department: string;
      level: string;
      salaryMin?: string;
      salaryMax?: string;
    }
  ): Promise<{
    designation: Designation & {
      salary_range?: string;
      created_at?: string;
    };
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/updatedesignation/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(designation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating designation:", error);
      throw error;
    }
  },

  // Delete designation
  deleteDesignation: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/deletedesignation/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error deleting designation:", error);
      throw error;
    }
  },
};

const DESIGNATIONS_QUERY_KEY = ["designations"] as const;

export default function Designations() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] =
    useState<Designation | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    data: designations = [],
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: DESIGNATIONS_QUERY_KEY,
    queryFn: api.getDesignations,
  });

  const error = isError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to fetch designations"
    : null;

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    description: "",
    level: "Mid-level",
    salaryMin: "",
    salaryMax: "",
  });

  const filteredDesignations = designations.filter(
    (designation) =>
      designation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      designation.department
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      designation.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Senior":
        return "bg-red-100 text-red-800";
      case "Mid-level":
        return "bg-yellow-100 text-yellow-800";
      case "Junior":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddDesignation = () => {
    setEditingDesignation(null);
    setFormData({
      title: "",
      department: "",
      description: "",
      level: "Mid-level",
      salaryMin: "",
      salaryMax: "",
    });
    setModalOpen(true);
  };

  const handleEditDesignation = (designation: Designation) => {
    setEditingDesignation(designation);

    // Parse salary range
    const salaryMatch = designation.salaryRange?.match(
      /\$([0-9,]+)\s*-\s*\$([0-9,]+)/
    );
    const salaryMin = salaryMatch ? salaryMatch[1].replace(/,/g, "") : "";
    const salaryMax = salaryMatch ? salaryMatch[2].replace(/,/g, "") : "";

    setFormData({
      title: designation.title,
      department: designation.department,
      description: designation.description || "",
      level: designation.level,
      salaryMin: salaryMin,
      salaryMax: salaryMax,
    });
    setModalOpen(true);
  };

  const handleDeleteDesignation = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this designation?")) {
      return;
    }

    try {
      await api.deleteDesignation(id);
      await queryClient.invalidateQueries({ queryKey: DESIGNATIONS_QUERY_KEY });
    } catch (error) {
      alert(
        "Failed to delete designation: " +
          (error instanceof Error ? error.message : String(error))
      );
      console.error("Error:", error);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.title.trim() || !formData.department.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (!formData.salaryMin || !formData.salaryMax) {
      alert("Please enter salary range");
      return;
    }

    try {
      setSubmitting(true);

      const submitData = {
        title: formData.title.trim(),
        department: formData.department.trim(),
        description: formData.description.trim(),
        level: formData.level,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
      };

      if (editingDesignation) {
        await api.updateDesignation(editingDesignation.id, submitData);
      } else {
        await api.createDesignation(submitData);
      }

      await queryClient.invalidateQueries({ queryKey: DESIGNATIONS_QUERY_KEY });
      setModalOpen(false);
      setFormData({
        title: "",
        department: "",
        description: "",
        level: "Mid-level",
        salaryMin: "",
        salaryMax: "",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      alert(
        editingDesignation
          ? "Failed to update designation: " + message
          : "Failed to create designation: " + message
      );
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const totalEmployees = designations.reduce((sum, d) => sum + d.employees, 0);
  const activeDesignations = designations.filter(
    (d) => d.status === "active"
  ).length;

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading designations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Error Alert */}
        {error && (
          <Card className="border-0 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-red-800 font-medium">{error}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetch()}
                  className="text-red-700 border-red-300 hover:bg-red-100 rounded-xl"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 bg-clip-text text-transparent">
              Designations
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage job roles and position hierarchy
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search designations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-64 rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200"
              />
            </div>
            <Button
              className="bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              onClick={handleAddDesignation}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Designation
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 bg-gradient-to-br from-sky-50 to-sky-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase">
                      Total Designations
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {designations.length}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-500">
                        +15%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 shadow-lg">
                    <Building className="w-8 h-8 text-white" />
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
                      Active Designations
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {activeDesignations}
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

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 bg-sky-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase">
                      Filled Positions
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {totalEmployees}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-500">
                        +22%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-600 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
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
                      Avg. Team Size
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {designations.length
                        ? Math.round(totalEmployees / designations.length)
                        : 0}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-500">
                        +5%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-500 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              <p className="text-gray-600">Loading designations...</p>
            </div>
          </div>
        ) : (
          /* Designations Grid */
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-sky-100 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-100 rounded-xl">
                    <Building className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">All Designations</CardTitle>
                    <CardDescription className="text-gray-500">
                      Search and manage job positions
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDesignations.map((designation) => (
                  <Card
                    key={designation.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
                  >
                    <CardContent className="p-0">
                      <div className="p-6 bg-gradient-to-br from-sky-50/30 to-white">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-sky-700 transition-colors">
                              {designation.title}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Building className="w-4 h-4 mr-1 text-sky-500" />
                              {designation.department}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/50 rounded-xl"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-white border-0 shadow-xl rounded-xl"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEditDesignation(designation)
                                }
                                className="text-sky-700 hover:bg-sky-50 rounded-lg cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                onClick={() =>
                                  handleDeleteDesignation(designation.id)
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                          {designation.description || "No description provided"}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <Badge
                            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ${getLevelColor(
                              designation.level
                            )}`}
                          >
                            {designation.level}
                          </Badge>
                          <Badge className="text-xs bg-emerald-100 text-emerald-800 border-0 rounded-full px-3 py-1 font-semibold">
                            {designation.status}
                          </Badge>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between p-3 bg-sky-50/50 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-sky-500" />
                              <span className="text-gray-600">Employees:</span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {designation.employees}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-emerald-500" />
                              <span className="text-gray-600">
                                Salary Range:
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {designation.salaryRange || "Not specified"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              Created: {designation.created}
                            </p>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                              <span className="text-xs text-emerald-600 font-medium">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No results */}
              {filteredDesignations.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="p-4 bg-sky-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Building className="w-8 h-8 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No designations found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search or add a new designation.
                  </p>
                  <Button
                    onClick={handleAddDesignation}
                    className="bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Designation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-2xl">
            <DialogHeader className="pb-4 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent">
                {editingDesignation
                  ? "Edit Designation"
                  : "Add New Designation"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-base">
                {editingDesignation
                  ? "Update the designation details below"
                  : "Fill in the details to create a new designation"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              {/* Title Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-semibold text-gray-700 flex items-center"
                >
                  Designation Title
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Senior Developer, Marketing Manager"
                  className="h-12 text-base rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 bg-white"
                  required
                />
                <p className="text-xs text-gray-500">
                  Enter a clear, descriptive job title
                </p>
              </div>

              {/* Department Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="department"
                  className="text-sm font-semibold text-gray-700 flex items-center"
                >
                  Department
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="e.g., Information Technology, Human Resources"
                  className="h-12 text-base rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 bg-white"
                  required
                />
                <p className="text-xs text-gray-500">
                  Specify which department this role belongs to
                </p>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-semibold text-gray-700 flex items-center"
                >
                  Job Description
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of responsibilities and key duties..."
                  className="w-full h-24 p-3 text-base rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 bg-white resize-none"
                  required
                />
                <p className="text-xs text-gray-500">
                  Provide a concise overview of the role's main responsibilities
                </p>
              </div>

              {/* Level Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="level"
                  className="text-sm font-semibold text-gray-700"
                >
                  Experience Level
                </Label>
                <div className="relative">
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full h-12 p-3 text-base rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 bg-white appearance-none cursor-pointer"
                  >
                    <option value="Junior">Junior Level</option>
                    <option value="Mid-level">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Select the appropriate experience level for this position
                </p>
              </div>

              {/* Salary Range Fields */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center">
                  Salary Range (USD)
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label
                      htmlFor="salaryMin"
                      className="text-xs text-gray-600"
                    >
                      Minimum Salary
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base">
                        $
                      </span>
                      <Input
                        id="salaryMin"
                        type="number"
                        value={formData.salaryMin}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            salaryMin: e.target.value,
                          })
                        }
                        placeholder="50000"
                        className="h-12 pl-8 text-base rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 bg-white"
                        min="0"
                        step="1000"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="salaryMax"
                      className="text-xs text-gray-600"
                    >
                      Maximum Salary
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base">
                        $
                      </span>
                      <Input
                        id="salaryMax"
                        type="number"
                        value={formData.salaryMax}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            salaryMax: e.target.value,
                          })
                        }
                        placeholder="70000"
                        className="h-12 pl-8 text-base rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 bg-white"
                        min="0"
                        step="1000"
                        required
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Set the compensation range for this position
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <DialogFooter className="pt-6 border-t border-gray-200 space-x-3 bg-gradient-to-r from-sky-50 to-white -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 text-base font-medium rounded-xl border-gray-300 hover:border-gray-400 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="px-6 py-2 text-base font-medium bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingDesignation ? "Updating..." : "Creating..."}
                  </>
                ) : editingDesignation ? (
                  "Update Designation"
                ) : (
                  "Create Designation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
