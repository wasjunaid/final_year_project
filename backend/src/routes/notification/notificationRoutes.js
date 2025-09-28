const express = require("express");
const NotificationController = require("../../controllers/Notification/NotificationController");

const router = express.Router();

router.get(
    '/',
    NotificationController.getNotifications
);

router.put(
    '/:notification_id',
    NotificationController.updateNotificationIsRead
);

router.put(
    '/',
    NotificationController.updateAllNotificationsIsRead
);

router.delete(
    '/:notification_id',
    NotificationController.deleteNotification
);

router.delete(
    '/',
    NotificationController.deleteAllNotifications
);

module.exports = router;