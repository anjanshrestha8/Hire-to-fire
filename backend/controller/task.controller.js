const Task = require("../models/task");
const User = require("../models/user");
const Notification = require("../models/notifications");
const Tasks = require("../models/task");

const TaskController = {
    // Your existing getAllTask method stays the same
    getAllTask: async (req, res) => {
        // Keep your existing implementation
        try {
          const tasks = await Tasks.findAll({
            order: [["createdAt", "DESC"]],
          });
          res.status(200).json(tasks);
        } catch (error) {
          console.error("Error fetching tasks:", error);
          res.status(500).json({ message: "Internal server error" });
        }
    },

    // Update your addTask method to include notification
    addTask: async (req, res) => {
        try {
            const {
                title,
                description,
                assigned_to,
                created_by,
                priority,
                status,
                due_date,
                progress_percentage
            } = req.body;

            // Validate required fields
            if (!title || !assigned_to || !created_by) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, assigned_to, and created_by are required'
                });
            }

            // Verify assigned user exists
            const assignedUser = await User.findByPk(assigned_to);
            if (!assignedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Assigned user not found'
                });
            }

            // Create the task
            const newTask = await Task.create({
                title,
                description,
                assigned_to,
                created_by,
                priority: priority || 'Medium',
                status: status || 'Pending',
                due_date,
                progress_percentage: progress_percentage || 0
            });

            // Get admin/creator info for notification
            const creator = await User.findByPk(created_by, {
                attributes: ['first_name', 'last_name']
            });

            // Create notification for the assigned user
            await Notification.create({
                user_id: assigned_to,
                title: 'New Task Assignment',
                message: `You have been assigned a new task: "${title}" by ${creator?.first_name} ${creator?.last_name}`,
                type: 'task_assignment',
                related_id: newTask.id,
                related_type: 'task',
                is_read: false
            });

            res.status(201).json({
                success: true,
                message: 'Task created and notification sent successfully',
                data: newTask
            });

        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create task',
                error: error.message
            });
        }
    },

    // Add method to update task status (employees can update their tasks)
    updateTaskStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, progress_percentage } = req.body;
            const userId = req.user?.userId; // From JWT token

            const task = await Task.findByPk(id);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            // Update task
            await task.update({
                status,
                progress_percentage: progress_percentage || task.progress_percentage
            });

            // Notify admin/creator about status change
            if (task.created_by !== userId) {
                const user = await User.findByPk(userId);

                await Notification.create({
                    user_id: task.created_by,
                    title: 'Task Status Updated',
                    message: `${user.first_name} ${user.last_name} updated task "${task.title}" status to ${status}`,
                    type: 'task_status_update',
                    related_id: task.id,
                    related_type: 'task',
                    is_read: false
                });
            }

            res.status(200).json({
                success: true,
                message: 'Task updated successfully',
                data: task
            });

        } catch (error) {
            console.error('Error updating task:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update task',
                error: error.message
            });
        }
    }
};

module.exports = TaskController;
