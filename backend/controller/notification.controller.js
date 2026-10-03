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
const Notification = require('../models/notifications');

const NotificationController = {
    // Get notifications for logged-in user
    getMyNotifications: async (req, res) => {
        try {
            const userId = req.user.userId; // From JWT token

            const notifications = await Notification.findAll({
                where: { user_id: userId },
                order: [["createdAt", "DESC"]],
                limit: 50
            });

            const unreadCount = notifications.filter(n => !n.is_read).length;

            res.status(200).json({
                success: true,
                data: notifications,
                unread_count: unreadCount
            });

        } catch (error) {
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
            const { id } = req.params;
            const userId = req.user.userId;

            const notification = await Notification.findOne({
                where: { id, user_id: userId }
            });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }

            await notification.update({ is_read: true });

            res.status(200).json({
                success: true,
                message: 'Notification marked as read'
            });

        } catch (error) {
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
            const userId = req.user.userId;

            await Notification.update(
                { is_read: true },
                { where: { user_id: userId, is_read: false } }
            );

            res.status(200).json({
                success: true,
                message: 'All notifications marked as read'
            });

        } catch (error) {
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
