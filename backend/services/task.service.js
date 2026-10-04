const Task = require("../models/task");
const User = require("../models/user");
const Notification = require("../models/notifications");
const Tasks = require("../models/task");
const ServiceError = require("../utils/serviceError");

async function getAllTask() {
  return Tasks.findAll({
    order: [["createdAt", "DESC"]],
  });
}

async function addTask(body) {
  const {
    title,
    description,
    assigned_to,
    created_by,
    priority,
    status,
    due_date,
    progress_percentage,
  } = body;

  if (!title || !assigned_to || !created_by) {
    throw new ServiceError(400, {
      success: false,
      message: "Title, assigned_to, and created_by are required",
    });
  }

  const assignedUser = await User.findByPk(assigned_to);
  if (!assignedUser) {
    throw new ServiceError(404, {
      success: false,
      message: "Assigned user not found",
    });
  }

  const newTask = await Task.create({
    title,
    description,
    assigned_to,
    created_by,
    priority: priority || "Medium",
    status: status || "Pending",
    due_date,
    progress_percentage: progress_percentage || 0,
  });

  const creator = await User.findByPk(created_by, {
    attributes: ["first_name", "last_name"],
  });

  await Notification.create({
    user_id: assigned_to,
    title: "New Task Assignment",
    message: `You have been assigned a new task: "${title}" by ${creator?.first_name} ${creator?.last_name}`,
    type: "task_assignment",
    related_id: newTask.id,
    related_type: "task",
    is_read: false,
  });

  return {
    success: true,
    message: "Task created and notification sent successfully",
    data: newTask,
  };
}

async function updateTaskStatus(id, body, userId) {
  const { status, progress_percentage } = body;

  const task = await Task.findByPk(id);
  if (!task) {
    throw new ServiceError(404, {
      success: false,
      message: "Task not found",
    });
  }

  await task.update({
    status,
    progress_percentage: progress_percentage || task.progress_percentage,
  });

  if (task.created_by !== userId) {
    const user = await User.findByPk(userId);

    await Notification.create({
      user_id: task.created_by,
      title: "Task Status Updated",
      message: `${user.first_name} ${user.last_name} updated task "${task.title}" status to ${status}`,
      type: "task_status_update",
      related_id: task.id,
      related_type: "task",
      is_read: false,
    });
  }

  return {
    success: true,
    message: "Task updated successfully",
    data: task,
  };
}

module.exports = {
  getAllTask,
  addTask,
  updateTaskStatus,
};
