// const Notification = require('../models/notifications');

// const NotificationController = {
//     SendNotification: async (req, res) => {
//          const { id } = req.params;
//          const notifications = await Notification.findAll({
//            where: { user_id : id },
//            order: [["createdAt", "DESC"]],
//          });
//          res.json(notifications);
//     }
// }

// module.exports = NotificationController;
const ServiceError = require("../utils/serviceError");
const notificationService = require("../services/notification.service");

const NotificationController = {
    // Get notifications for logged-in user
    getMyNotifications: async (req, res) => {
        try {
            const result = await notificationService.getMyNotifications(
                req.user.userId
            );
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ServiceError) {
                return res.status(error.statusCode).json(error.body);
            }
            console.error('Error fetching notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch notifications',
                error: error.message
            });
        }
    },

    // Mark notification as read
    markAsRead: async (req, res) => {
        try {
            const result = await notificationService.markAsRead(
                req.params.id,
                req.user.userId
            );
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ServiceError) {
                return res.status(error.statusCode).json(error.body);
            }
            console.error('Error marking notification as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update notification',
                error: error.message
            });
        }
    },

    // Mark all notifications as read
    markAllAsRead: async (req, res) => {
        try {
            const result = await notificationService.markAllAsRead(
                req.user.userId
            );
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ServiceError) {
                return res.status(error.statusCode).json(error.body);
            }
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update notifications',
                error: error.message
            });
        }
    }
};

module.exports = NotificationController;
