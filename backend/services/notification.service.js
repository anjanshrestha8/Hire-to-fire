const ServiceError = require("../utils/serviceError");
const Notification = require("../models/notifications");

const notificationService = {
  getMyNotifications: async (userId) => {
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return {
      success: true,
      data: notifications,
      unread_count: unreadCount,
    };
  },

  markAsRead: async (id, userId) => {
    const notification = await Notification.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      throw new ServiceError(404, {
        success: false,
        message: "Notification not found",
      });
    }

    await notification.update({ is_read: true });

    return {
      success: true,
      message: "Notification marked as read",
    };
  },

  markAllAsRead: async (userId) => {
    await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );

    return {
      success: true,
      message: "All notifications marked as read",
    };
  },
};

module.exports = notificationService;
