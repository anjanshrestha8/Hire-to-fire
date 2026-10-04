import TaskCard from "./TaskCard";

interface ITask {
  id: number;
  title: string;
  status: string;
}

const KanbanColumn = ({ title, tasks }: { title: string; tasks: ITask[] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-h-[400px] flex flex-col">
      <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
        {title}
      </h2>

      <div className="flex flex-col gap-3">
        {tasks?.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={() => console.log("status changed")}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
