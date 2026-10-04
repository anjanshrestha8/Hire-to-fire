import axiosInstanace from "@/Interceptor/axiosInstance";
import { useState } from "react";

interface ITask {
  id: number;
  title: string;
  status: string;
}

const TaskCard = ({
  task,
  onStatusChange,
}: {
  task: ITask;
  onStatusChange: (id: number, status: string) => void;
}) => {
  const [status, setStatus] = useState(task.status);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    onStatusChange(task.id, newStatus);

    try {
      await axiosInstanace.patch(`/api/tasks/${task.id}/status`, {
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 shadow-sm hover:shadow-md transition">
      <p className="font-medium text-gray-800">{task.title}</p>
      <select
        value={status}
        onChange={handleChange}
        className="mt-2 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="Pending">To do</option>
        <option value="In Progress">In progress</option>
        <option value="Completed">Done</option>
      </select>
    </div>
  );
};

export default TaskCard;
