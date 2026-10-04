import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Download,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Layout } from "@/components/Layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import axiosInstanace from "@/Interceptor/axiosInstance";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { BASE_URL } from "@/constants/api.constant";

interface IEmployee {
  first_name: string;
  last_name: string;
  id: number;
  email: string;
  phone?: string;
  phoneNumber?: string;
  department: string | { name: string };
  designation: string | { title: string };
  status: "Active" | "Inactive" | string;
  createdAt: string;
  avatar: string;
}

const EMPLOYEES_QUERY_KEY = ["employees"] as const;
const DEPARTMENTS_QUERY_KEY = ["departments"] as const;
const DESIGNATIONS_QUERY_KEY = ["designations"] as const;

async function fetchEmployees(): Promise<IEmployee[]> {
  const res = await axiosInstanace.get("/api/employee/employee");
  return res.data.users;
}

async function fetchDepartments(): Promise<{ id: string; name: string }[]> {
  const res = await axiosInstanace.get(
    `${BASE_URL}/api/department/department`
  );
  return res.data.departments;
}

async function fetchDesignations(): Promise<{ id: string; title: string }[]> {
  const res = await axiosInstanace.get(
    `${BASE_URL}/api/designation/getdesignation`
  );
  return res.data;
}

export default function Employees() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: employees = [] } = useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchEmployees();
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data.message);
        } else {
          toast.error("Something went wrong");
        }
        throw error;
      }
    },
  });
  const { data: departments = [] } = useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchDepartments();
      } catch (error) {
        console.error("Failed to fetch departments", error);
        toast.error("Failed to load departments");
        throw error;
      }
    },
  });
  const { data: designations = [] } = useQuery({
    queryKey: DESIGNATIONS_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchDesignations();
      } catch (error) {
        console.error("Failed to fetch designations", error);
        toast.error("Failed to load designations");
        throw error;
      }
    },
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(
    null
  );
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [employeeCode] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-Time");

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName) toast.error(`Please fill the firstName`);
    else if (!lastName) toast.error(`Please fill the lastName`);
    else if (!employeeEmail) toast.error(`Please fill the employeeEmail`);
    else if (!employeePassword) toast.error(`Please fill the employeePassword`);
    else if (!departmentId) toast.error(`Please fill the department`);
    else if (!designationId) toast.error(`Please fill the designation`);

    try {
      const res = await axiosInstanace.post("/api/employee/addEmployee", {
        email: employeeEmail,
        password: employeePassword,
        first_name: firstName,
        last_name: lastName,
        role: "employee",
        department_id: departmentId,
        designation_id: designationId,
        employee_code: employeeCode,
        hire_date: hireDate,
        phone,
        address,
        emergency_contact: emergencyContact,
        employment_type: employmentType,
      });

      if (res.status === 201) {
        toast.success("Employee added successfully");
        await queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
        setModalOpen(false);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        return toast.error(
          error.response?.data.message || "Failed to add employee"
        );
      }
      return toast.error("Something went wrong");
    }
  };

  // Handle edit employee
  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingEmployee) return;

    try {
      const updatedEmployee = {
        first_name: editingEmployee.first_name,
        last_name: editingEmployee.last_name,
        email: editingEmployee.email,
        // phone: editingEmployee.phoneNumber,
        department: editingEmployee.department,
        designation: editingEmployee.designation,
      };

      const res = await axiosInstanace.put(
        `/api/employee/employee/${editingEmployee.id}`,
        updatedEmployee
      );

      if (res.status === 200) {
        toast.success("Employee updated successfully");
        await queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
        setEditModalOpen(false);
        setEditingEmployee(null);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        return toast.error(
          error.response?.data.message || "Failed to update employee"
        );
      }
      return toast.error("Something went wrong");
    }
  };

  // Handle delete employee
  const handleDeleteEmployee = async (
    employeeId: number,
    employeeName: string
  ) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}?`)) {
      return;
    }

    try {
      const res = await axiosInstanace.delete(
        `/api/employee/employee/${employeeId}`
      );

      if (res.status === 200) {
        toast.success("Employee deleted successfully");
        await queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        return toast.error(
          error.response?.data.message || "Failed to delete employee"
        );
      }
      return toast.error("Something went wrong");
    }
  };

  // Open edit modal
  const openEditModal = (employee: IEmployee) => {
    setEditingEmployee(employee);
    setEditModalOpen(true);
  };

  // Functional search filter
  const filteredEmployees = employees.filter((employee) => {
    const departmentName =
      typeof employee.department === "string"
        ? employee.department
        : employee.department?.name ?? "";
    const designationTitle =
      typeof employee.designation === "string"
        ? employee.designation
        : employee.designation?.title ?? "";
    const query = searchQuery.toLowerCase();
    return (
      employee.first_name.toLowerCase().includes(query) ||
      employee.last_name.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      departmentName.toLowerCase().includes(query) ||
      designationTitle.toLowerCase().includes(query)
    );
  });

  const totalEmployees = employees.length || 0;
  const activeEmployees =
    employees.filter((emp) => emp.status === "Active").length || 0;
  const onLeaveEmployees =
    employees.filter((emp) => emp.status === "On Leave").length || 0;
  const thisMonthJoined =
    employees.filter((emp) => {
      const joinDate = new Date(emp.createdAt);
      const currentDate = new Date();
      return (
        joinDate.getMonth() === currentDate.getMonth() &&
        joinDate.getFullYear() === currentDate.getFullYear()
      );
    }).length || 0;

  const handleExport = () => {
    if (!employees || employees.length === 0) {
      return toast.error("No employees to export");
    }

    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Department",
      "Designation",
      "Status",
      "Joined Date",
    ];

    const rows = employees.map((emp) => [
      emp.id,
      emp.first_name,
      emp.last_name,
      emp.email,
      emp.phoneNumber,
      emp.department,
      emp.designation,
      emp.status,
      new Date(emp.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "employees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 bg-clip-text text-transparent">
              Employee Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage your team members and their information
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sky-400" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-64 rounded-xl border-sky-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <Button
              className="bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 hover:from-sky-500 hover:via-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              onClick={() => setModalOpen(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats (Updated UI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 bg-sky-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase">
                      Total Employees
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {totalEmployees}
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
                  <div className="p-4 rounded-2xl bg-sky-500 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
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
                      Active
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {activeEmployees}
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
                      On Leave
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {onLeaveEmployees}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-500">
                        -2%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-500 shadow-lg">
                    <Calendar className="w-8 h-8 text-white" />
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
                      New This Month
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {thisMonthJoined}
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
                  <div className="p-4 rounded-2xl bg-sky-600 shadow-lg">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Employee Grid */}
        <Card className="border border-sky-200 bg-white shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-sky-50 to-sky-100 border-b border-sky-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-sky-800">
                  All Employees
                </CardTitle>
                <CardDescription className="text-sky-600">
                  Search and manage your team members
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative md:hidden">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-sky-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl border-sky-200 focus:ring-sky-500"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-sky-300 text-sky-700 hover:bg-sky-50"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Employee Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sky-50 border-sky-200">
                    <TableHead className="text-sky-800 font-semibold">
                      ID
                    </TableHead>
                    <TableHead className="text-sky-800 font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-sky-800 font-semibold">
                      Email
                    </TableHead>
                    <TableHead className="text-sky-800 font-semibold">
                      Phone
                    </TableHead>
                    <TableHead className="text-sky-800 font-semibold">
                      Department
                    </TableHead>
                    <TableHead className="text-sky-800 font-semibold">
                      Designation
                    </TableHead>
                    <TableHead className="text-sky-800 font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-sky-800 font-semibold">
                      Joined
                    </TableHead>
                    <TableHead className="text-sky-800 font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees?.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="text-sky-700 font-medium bg-white hover:bg-sky-25 border-sky-100"
                    >
                      <TableCell className="text-sky-600">
                        {employee.id}
                      </TableCell>
                      <TableCell className="text-sky-800 font-semibold">
                        {employee.first_name} {employee.last_name}
                      </TableCell>
                      <TableCell className="text-sky-600">
                        {employee.email}
                      </TableCell>
                      <TableCell className="text-sky-600">
                        {employee.phoneNumber}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-sky-100 text-sky-800 border-sky-200 rounded-md">
                          {typeof employee.department === "string"
                            ? employee.department
                            : employee.department?.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sky-600">
                        {typeof employee.designation === "string"
                          ? employee.designation
                          : employee.designation?.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            employee.status === "active"
                              ? "bg-green-300 text-green-900 border-green-300"
                              : employee.status === "onLeave"
                              ? "bg-red-300 text-red-900 border-red-300"
                              : "bg-sky-200 text-sky-900 border-sky-300"
                          } rounded-md`}
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sky-600">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-sky-100 text-sky-700"
                            onClick={() => openEditModal(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 text-red-600"
                            onClick={() =>
                              handleDeleteEmployee(
                                employee.id,
                                `${employee.first_name} ${employee.last_name}`
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Employee Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogOverlay className="fixed inset-0 bg-sky-900/60 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border-0 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-sky-200 bg-gradient-to-r from-sky-50 to-sky-100">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-sky-800">
                  Add New Employee
                </DialogTitle>
                <p className="text-sky-600 mt-2">
                  Fill in all required details to add a new team member
                </p>
              </DialogHeader>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto p-6 flex-1">
              <form onSubmit={handleAddEmployee} className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-sky-800 mb-4 border-b border-sky-200 pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sky-700 font-medium">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g., John"
                        className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g., Doe"
                        className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        value={employeeEmail}
                        onChange={(e) => setEmployeeEmail(e.target.value)}
                        placeholder="e.g., john@company.com"
                        className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">
                        Phone Number
                      </Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g., +1 (555) 123-4567"
                        className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-sky-800 mb-4 border-b border-sky-200 pb-2">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sky-700 font-medium">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="password"
                        value={employeePassword}
                        onChange={(e) => setEmployeePassword(e.target.value)}
                        placeholder="Set a secure password"
                        className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                        required
                      />
                      <p className="text-sky-500 text-xs mt-1">
                        Minimum 8 characters with letters and numbers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employment Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-sky-800 mb-4 border-b border-sky-200 pb-2">
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sky-700 font-medium">
                        Department
                      </Label>
                      <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className="mt-2 flex h-10 w-full rounded-xl border border-sky-200 px-3 text-sm focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">
                        Designation
                      </Label>
                      <select
                        value={designationId}
                        onChange={(e) => setDesignationId(e.target.value)}
                        className="mt-2 flex h-10 w-full rounded-xl border border-sky-200 px-3 text-sm focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Select Designation</option>
                        {designations.map((desg) => (
                          <option key={desg.id} value={desg.id}>
                            {desg.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">
                        Hire Date
                      </Label>
                      <Input
                        type="date"
                        value={hireDate}
                        onChange={(e) => setHireDate(e.target.value)}
                        className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">
                        Employment Type
                      </Label>
                      <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-sky-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-sky-800 mb-4 border-b border-sky-200 pb-2">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <Label className="text-sky-700 font-medium">
                        Address
                      </Label>
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter full address"
                        className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">
                        Emergency Contact
                      </Label>
                      <Input
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        placeholder="Name and phone number"
                        className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <DialogFooter className="flex justify-end gap-3 p-6 border-t border-sky-200 bg-sky-25 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-xl px-6 border-sky-200 text-sky-700 hover:bg-sky-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleAddEmployee}
              >
                Add Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogOverlay className="fixed inset-0 bg-sky-900/60 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-md bg-white rounded-2xl p-0 shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Edit Employee
                </DialogTitle>
                <p className="text-sky-100 mt-2">Update employee information</p>
              </DialogHeader>
            </div>
            <div className="p-6 space-y-6">
              {editingEmployee && (
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="editFirstName"
                      className="text-sm font-semibold text-sky-700"
                    >
                      First Name
                    </Label>
                    <Input
                      id="editFirstName"
                      type="text"
                      value={editingEmployee.first_name}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          first_name: e.target.value,
                        })
                      }
                      placeholder="Enter first name"
                      className="mt-2 rounded-xl border-sky-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="editLastName"
                      className="text-sm font-semibold text-sky-700"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="editLastName"
                      type="text"
                      value={editingEmployee.last_name}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          last_name: e.target.value,
                        })
                      }
                      placeholder="Enter last name"
                      className="mt-2 rounded-xl border-sky-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="editEmail"
                      className="text-sm font-semibold text-sky-700"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="editEmail"
                      type="email"
                      value={editingEmployee.email}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter employee email"
                      className="mt-2 rounded-xl border-sky-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="editPhone"
                      className="text-sm font-semibold text-sky-700"
                    >
                      Phone
                    </Label>
                    <Input
                      id="editPhone"
                      type="text"
                      // value={editingEmployee.phoneNumber}
                      onChange={() =>
                        setEditingEmployee({
                          ...editingEmployee,
                          // phoneNumber: e.target.value,
                        })
                      }
                      placeholder="Enter phone number"
                      className="mt-2 rounded-xl border-sky-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="editDepartment"
                      className="text-sm font-semibold text-sky-700"
                    >
                      Department
                    </Label>
                    <Input
                      id="editDepartment"
                      type="text"
                      value={
                        typeof editingEmployee.department === "string"
                          ? editingEmployee.department
                          : editingEmployee.department?.name ?? ""
                      }
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          department: e.target.value,
                        })
                      }
                      placeholder="Enter department"
                      className="mt-2 rounded-xl border-sky-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="editDesignation"
                      className="text-sm font-semibold text-sky-700"
                    >
                      Designation
                    </Label>
                    <Input
                      id="editDesignation"
                      type="text"
                      value={
                        typeof editingEmployee.designation === "string"
                          ? editingEmployee.designation
                          : editingEmployee.designation?.title ?? ""
                      }
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          designation: e.target.value,
                        })
                      }
                      placeholder="Enter designation"
                      className="mt-2 rounded-xl border-sky-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditEmployee}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Update Employee
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
