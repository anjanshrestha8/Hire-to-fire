import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employee";
import NotFound from "./pages/NotFound";
import Tasks from "./pages/Tasks";
import Login from "./pages/Login";
import Register from "./pages/register";
import Departments from "./pages/Department";
import Messages from "./pages/Messages";
import VideoCalls from "./pages/VideoCalls";
import Designations from "./pages/Designation";
import CodeEditor from "./pages/CodeEditor";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
      <Route
        path="/"
        element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}
      >
        <Route index element={<Dashboard />} />
      </Route>

      <Route
        path="/employees"
        element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}
      >
        <Route index element={<Employees />} />
      </Route>

      <Route
        path="/tasks"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "employee"]} />
        }
      >
        <Route index element={<Tasks />} />
      </Route>

      <Route
        path="/departments"
        element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}
      >
        <Route index element={<Departments />} />
      </Route>

      <Route
        path="/messages"
        element={<ProtectedRoute allowedRoles={["admin", "employee"]} />}
      >
        <Route index element={<Messages />} />
      </Route>

      <Route
        path="/designations"
        element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}
      >
        <Route index element={<Designations />} />
      </Route>

      <Route
        path="/video"
        element={<ProtectedRoute allowedRoles={["admin", "employee"]} />}
      >
        <Route index element={<VideoCalls />} />
      </Route>

      <Route
        path="/code-editor"
        element={<ProtectedRoute allowedRoles={["admin", "employee"]} />}
      >
        <Route index element={<CodeEditor />} />
      </Route>
    </Routes>
  </QueryClientProvider>
);

export default App;
