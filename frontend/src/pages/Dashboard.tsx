import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  CheckSquare,
  TrendingUp,
  Clock,
  UserPlus,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { Layout } from "../components/Layout";
import { Input } from "@/components/ui/input";
import axiosInstanace from "@/Interceptor/axiosInstance";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "@/constants/api.constant";

interface Task {
  id: number;
  title: string;
  assigned_to: number;
  priority: string;
  status: string;
  progress?: number;
}

interface Meeting {
  id: number;
  topic: string;
  start_time: string;
  status?: string;
}

interface Employee {
  id: number;
  first_name: string;
}

export default function Dashboard() {
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [employee, setEmployee] = useState<Employee[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Employees",
      value: employee.length,
      change: "+12%",
      icon: Users,
      color: "text-sky-600",
      bgColor: "bg-gradient-to-br from-sky-50 to-sky-100",
      iconBg: "bg-gradient-to-br from-sky-400 to-sky-500",
    },
    {
      title: "Active Tasks",
      value: recentTasks.length,
      change: "+8%",
      icon: CheckSquare,
      color: "text-sky-600",
      bgColor: "bg-gradient-to-br from-sky-50 to-sky-100",
      iconBg: "bg-gradient-to-br from-sky-400 to-sky-500",
    },
    {
      title: "Productivity",
      value: "94%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-sky-600",
      bgColor: "bg-gradient-to-br from-sky-50 to-sky-100",
      iconBg: "bg-gradient-to-br from-sky-400 to-sky-500",
    },
  ];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axiosInstanace.get("/api/tasks/getalltask");
        if (res.data && Array.isArray(res.data)) {
          setRecentTasks(res.data);
        }

        console.log(res.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  console.log(employee);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstanace.get("/api/employee/employee");
        if (res.data.users && Array.isArray(res.data.users)) {
          setEmployee(res.data.users);
        }

        console.log(res.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/meet/list-meetings`);
        if (res.data && Array.isArray(res.data.meetings)) {
          console.log("Zoom response", res.data);
          const today = new Date().toISOString().split("T")[0];
          const filtered = res.data.meetings.filter(
            (m: Meeting) => m.start_time.split("T")[0] === today
          );

          setUpcomingMeetings(filtered);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setLoadingMeetings(false);
      }
    };
    fetchMeetings();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-600 border-red-200";
      case "Medium":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "Low":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "In Progress":
        return "bg-sky-50 text-sky-600 border-sky-200";
      case "Pending":
        return "bg-amber-50 text-amber-600 border-amber-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const updateTaskStatus = (taskId: number, newStatus: string) => {
    setRecentTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              progress: newStatus === "Completed" ? 100 : task.progress,
            }
          : task
      )
    );
  };

  const joinMeeting = (meetingId: number) => {
    setUpcomingMeetings((prevMeetings) =>
      prevMeetings.map((meeting) =>
        meeting.id === meetingId ? { ...meeting, status: "joined" } : meeting
      )
    );
    console.log(`Joining meeting ${meetingId}`);
  };

  console.log({ recentTasks });

  const getEmployeeName = (userId: number) => {
    const user = employee.find((emp) => emp.id === userId);
    console.log({ user });
    return user ? user.first_name : "Unknown";
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search anything..."
                className="pl-10 pr-4 w-64 rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200"
              />
            </div>
            <Button
              className="bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              onClick={() => navigate("/employees")}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
            >
              <CardContent className="p-0">
                <div className={`p-6 ${stat.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-500">
                          {stat.change}
                        </span>
                        <span className="text-xs text-gray-500">
                          vs last month
                        </span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl ${stat.iconBg} shadow-lg`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Tasks */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-sky-100 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-100 rounded-xl">
                    <CheckSquare className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Recent Tasks</CardTitle>
                    <CardDescription className="text-gray-500">
                      Latest task assignments and updates
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto p-6 space-y-4">
                {loadingTasks ? (
                  <p className="text-gray-500">Loading tasks...</p>
                ) : recentTasks.length === 0 ? (
                  <p className="text-gray-500">No recent tasks available.</p>
                ) : (
                  recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group p-4 bg-sky-50/30 rounded-xl hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Assigned to {getEmployeeName(task.assigned_to)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <button
                            onClick={() => {
                              const newStatus =
                                task.status === "Completed"
                                  ? "In Progress"
                                  : task.status === "In Progress"
                                  ? "Completed"
                                  : "In Progress";
                              updateTaskStatus(task.id, newStatus);
                            }}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-sky-400 to-sky-500 h-2 rounded-full"
                              style={{ width: `${task.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {task.progress || 0}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-sky-100 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-100 rounded-xl">
                    <Clock className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Today's Schedule</CardTitle>
                    <CardDescription className="text-gray-500">
                      Upcoming meetings and events
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto p-6 space-y-4">
                {loadingMeetings ? (
                  <p className="text-gray-500">Loading meetings...</p>
                ) : upcomingMeetings.length === 0 ? (
                  <p className="text-gray-500">
                    No meetings scheduled for today.
                  </p>
                ) : (
                  upcomingMeetings.map((meeting, index) => (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-1 h-12 rounded-full ${
                            index % 2 === 0
                              ? "bg-gradient-to-b from-sky-400 to-sky-500"
                              : "bg-gradient-to-b from-sky-300 to-sky-400"
                          }`}
                        ></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {meeting.topic}
                          </h4>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {meeting.start_time}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => joinMeeting(meeting.id)}
                        disabled={meeting.status === "joined"}
                        className={`rounded-xl ${
                          meeting.status === "joined"
                            ? "bg-emerald-400 hover:bg-emerald-500 text-white"
                            : "bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white"
                        }`}
                      >
                        {meeting.status === "joined" ? "Joined" : "Join"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
