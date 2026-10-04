import { useEffect, useState } from "react";
import NotificationBell from "@/components/NotificationBell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckSquare,
  Search,
  Plus,
  Calendar,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import axiosInstanace from "@/Interceptor/axiosInstance";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import KanbanColumn from "@/components/KanbanColumn";

interface ITasks {
  id: number;
  title: string;
  description: string;
  assignee: string;
  assigneeAvatar: string;
  status: "Completed" | "In Progress" | "Pending" | "On Hold" | string;
  priority: "Critical" | "High" | "Medium" | "Low" | string;
  dueDate: string;
  progress_percentage: number;
  category: string;
  createdAt: string;
  assigned_to: number;
  created_by: number;
}

interface ICreateTaskRequest {
  title: string;
  description: string;
  assigned_to: number;
  created_by: number;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
  due_date: string;
  progress_percentage: number;
}

interface IEmployee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  designation: string;
}

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<ITasks[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITasks | null>(null);
  const [assigningTask, setAssigningTask] = useState<ITasks | null>(null);
  const [formData, setFormData] = useState<ICreateTaskRequest>(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      title: "",
      description: "",
      assigned_to: 0,
      created_by: typeof user?.id === "number" ? user.id : 0,
      priority: "Medium",
      status: "Pending",
      due_date: "",
      progress_percentage: 0,
    };
  });
  const [employees, setEmployees] = useState<IEmployee[]>([]);

  // Fetch tasks
  const getTasks = async () => {
    try {
      const response = await axiosInstanace.get("/api/tasks/getalltask");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    void getTasks();
  }, []);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await axiosInstanace.get("/api/employee/employee");
        setEmployees(response.data.users);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    }
    void fetchEmployees();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "assigned_to" ||
        name === "created_by" ||
        name === "progress_percentage"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstanace.post("/api/tasks/addTask", formData, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Task created successfully");
      setShowDialog(false);
      getTasks();
      // Reset form
      setFormData({
        title: "",
        description: "",
        assigned_to: 0,
        created_by: JSON.parse(localStorage.getItem("user") || "{}").id || 0,
        priority: "Medium",
        status: "Pending",
        due_date: "",
        progress_percentage: 0,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create task");
    }
  };

  // Handle edit task
  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const updatedTask = {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        status: editingTask.status,
        due_date: editingTask.dueDate,
        progress_percentage: editingTask.progress_percentage,
      };

      const res = await axiosInstanace.put(
        `/api/tasks/updateTask/${editingTask.id}`,
        updatedTask
      );

      if (res.status === 200) {
        toast.success("Task updated successfully");
        getTasks();
        setEditModalOpen(false);
        setEditingTask(null);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        return toast.error(
          error.response?.data.message || "Failed to update task"
        );
      }
      return toast.error("Something went wrong");
    }
  };

  // Handle assign task
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTask) return;

    try {
      const res = await axiosInstanace.put(
        `/api/tasks/assignTask/${assigningTask.id}`,
        {
          assigned_to: assigningTask.assigned_to,
        }
      );

      if (res.status === 200) {
        toast.success("Task assigned successfully");
        getTasks();
        setAssignModalOpen(false);
        setAssigningTask(null);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        return toast.error(
          error.response?.data.message || "Failed to assign task"
        );
      }
      return toast.error("Something went wrong");
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    pending: tasks.filter((t) => t.status === "Pending").length,
  };

  const columns = [
    { id: 1, title: "To do", status: "Pending" },
    { id: 2, title: "In progress", status: "In Progress" },
    { id: 3, title: "Done", status: "Completed" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 bg-clip-text text-transparent">
              Task Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Assign, track, and manage team tasks efficiently
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sky-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-64 rounded-xl border-sky-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 hover:from-sky-500 hover:via-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
                  onClick={() => setShowDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border-0 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-sky-200 bg-gradient-to-r from-sky-50 to-sky-100">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-sky-800">
                      Create New Task
                    </DialogTitle>
                    <DialogDescription className="text-sky-600 mt-2">
                      Fill in the details below to assign a new task.
                    </DialogDescription>
                  </DialogHeader>
                </div>

                <div className="overflow-y-auto p-6 flex-1">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-sky-800 mb-4 border-b border-sky-200 pb-2">
                        Task Information
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <Label className="text-sky-700 font-medium">
                            Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter task title"
                            className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                            required
                          />
                        </div>

                        <div>
                          <Label className="text-sky-700 font-medium">
                            Description <span className="text-red-500">*</span>
                          </Label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter task description"
                            className="w-full border border-sky-200 rounded-xl p-3 mt-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                            rows={4}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-sky-800 mb-4 border-b border-sky-200 pb-2">
                        Assignment Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sky-700 font-medium">
                            Assign To <span className="text-red-500">*</span>
                          </Label>
                          <select
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleChange}
                            className="mt-2 flex h-10 w-full rounded-xl border border-sky-200 px-3 text-sm focus:ring-2 focus:ring-sky-500"
                            required
                          >
                            <option value="">Select Assignee</option>
                            {employees?.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label className="text-sky-700 font-medium">
                            Due Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                            required
                          />
                        </div>

                        <div>
                          <Label className="text-sky-700 font-medium">
                            Status
                          </Label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-2 flex h-10 w-full rounded-xl border border-sky-200 px-3 text-sm focus:ring-2 focus:ring-sky-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        <div>
                          <Label className="text-sky-700 font-medium">
                            Priority
                          </Label>
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="mt-2 flex h-10 w-full rounded-xl border border-sky-200 px-3 text-sm focus:ring-2 focus:ring-sky-500"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <Label className="text-sky-700 font-medium">
                            Progress (%)
                          </Label>
                          <Input
                            type="number"
                            name="progress_percentage"
                            value={formData.progress_percentage}
                            onChange={handleChange}
                            placeholder="Progress (%)"
                            min="0"
                            max="100"
                            className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                <DialogFooter className="flex justify-end gap-3 p-6 border-t border-sky-200 bg-sky-25 flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                    className="rounded-xl px-6 border-sky-200 text-sky-700 hover:bg-sky-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={handleSubmit}
                  >
                    Create Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Total Tasks",
              value: taskStats.total,
              icon: CheckSquare,
              color: "bg-sky-100 text-sky-600",
            },
            {
              label: "In Progress",
              value: taskStats.inProgress,
              icon: Clock,
              color: "bg-sky-100 text-sky-600",
            },
            {
              label: "Completed",
              value: taskStats.completed,
              icon: CheckSquare,
              color: "bg-sky-100 text-sky-600",
            },
            {
              label: "Pending",
              value: taskStats.pending,
              icon: Calendar,
              color: "bg-sky-100 text-sky-600",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 bg-sky-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 uppercase">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stat.value}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-emerald-500">
                            +8%
                          </span>
                          <span className="text-xs text-gray-500">
                            vs last week
                          </span>
                        </div>
                      </div>
                      <div
                        className={`p-4 rounded-2xl ${stat.color.replace(
                          "bg-sky-100 text-sky-600",
                          "bg-sky-500"
                        )} shadow-lg`}
                      >
                        <stat.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Task Table */}
        <div className="flex gap-6 p-6 bg-gray-100 min-h-screen">
          {columns?.map((item) => (
            <div className="flex-1" key={item.id}>
              <KanbanColumn
                title={item.title}
                tasks={tasks.filter((task) => {
                  console.log(task.status);
                  console.log(item.status);
                  return task.status === item.status;
                })}
              />
            </div>
          ))}
        </div>

        {/* Edit Task Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogOverlay className="fixed inset-0 bg-sky-900/60 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border-0 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-sky-200 bg-gradient-to-r from-sky-50 to-sky-100">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-sky-800">
                  Edit Task
                </DialogTitle>
                <p className="text-sky-600 mt-2">Update task information</p>
              </DialogHeader>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              {editingTask && (
                <form onSubmit={handleEditTask} className="space-y-6">
                  <div>
                    <Label className="text-sky-700 font-medium">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={editingTask.title}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter task title"
                      className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sky-700 font-medium">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      value={editingTask.description}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter task description"
                      className="w-full border border-sky-200 rounded-xl p-3 mt-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sky-700 font-medium">Status</Label>
                      <select
                        value={editingTask.status}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            status: e.target.value,
                          })
                        }
                        className="mt-2 flex h-10 w-full rounded-xl border border-sky-200 px-3 text-sm focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sky-700 font-medium">
                        Priority
                      </Label>
                      <select
                        value={editingTask.priority}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            priority: e.target.value,
                          })
                        }
                        className="mt-2 flex h-10 w-full rounded-xl border border-sky-200 px-3 text-sm focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sky-700 font-medium">
                        Due Date
                      </Label>
                      <Input
                        type="date"
                        value={
                          editingTask.dueDate
                            ? new Date(editingTask.dueDate)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            dueDate: e.target.value,
                          })
                        }
                        className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <Label className="text-sky-700 font-medium">
                        Progress (%)
                      </Label>
                      <Input
                        type="number"
                        value={editingTask.progress_percentage}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            progress_percentage: Number(e.target.value),
                          })
                        }
                        placeholder="Progress (%)"
                        min="0"
                        max="100"
                        className="mt-2 rounded-xl border-sky-200 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            <DialogFooter className="flex justify-end gap-3 p-6 border-t border-sky-200 bg-sky-25 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="rounded-xl px-6 border-sky-200 text-sky-700 hover:bg-sky-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleEditTask}
              >
                Update Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Task Modal */}
        <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
          <DialogOverlay className="fixed inset-0 bg-sky-900/60 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-md bg-white rounded-2xl p-0 shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Assign Task
                </DialogTitle>
                <p className="text-sky-100 mt-2">
                  Reassign this task to a team member
                </p>
              </DialogHeader>
            </div>
            <div className="p-6 space-y-6">
              {assigningTask && (
                <div className="space-y-4">
                  <div className="p-4 bg-sky-50 rounded-xl">
                    <h4 className="font-semibold text-sky-800">
                      {assigningTask.title}
                    </h4>
                    <p className="text-sm text-sky-600 mt-1">
                      {assigningTask.description}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-sky-700">
                      Assign To <span className="text-red-500">*</span>
                    </Label>
                    <select
                      value={assigningTask.assigned_to || ""}
                      onChange={(e) =>
                        setAssigningTask({
                          ...assigningTask,
                          assigned_to: Number(e.target.value),
                        })
                      }
                      className="mt-2 flex h-10 w-full rounded-xl border border-sky-200 px-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select Team Member</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} - {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> The assigned user will be notified
                      about this task assignment.
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignTask}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Assign Task
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
