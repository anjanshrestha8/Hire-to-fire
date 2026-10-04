const ServiceError = require("../utils/serviceError");
const taskService = require("../services/task.service");

const TaskController = {
  getAllTask: async (req, res) => {
    try {
      const tasks = await taskService.getAllTask();
      res.status(200).json(tasks);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  addTask: async (req, res) => {
    try {
      const result = await taskService.addTask(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error creating task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create task",
        error: error.message,
      });
    }
  },

  updateTaskStatus: async (req, res) => {
    try {
      const result = await taskService.updateTaskStatus(
        req.params.id,
        req.body,
        req.user?.userId
      );
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error updating task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update task",
        error: error.message,
      });
    }
  },
};

module.exports = TaskController;
