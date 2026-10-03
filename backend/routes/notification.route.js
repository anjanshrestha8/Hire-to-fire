const express = require("express");
const router = express.Router();
const NotificationController = require("../controller/notification.controller");
const { authMiddleware } = require("../controller/user.controller");

router.get("/my", authMiddleware.verifyToken, NotificationController.getMyNotifications);
router.patch("/:id/read", authMiddleware.verifyToken, NotificationController.markAsRead);
router.patch(
  "/mark-all-read",
  authMiddleware.verifyToken,
  NotificationController.markAllAsRead
);

module.exports = router;
