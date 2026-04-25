const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { NotificationService } = require("../../services/Notification/NotificationService");

class NotificationController {
    async getNotificationsIfExists(req, res) {
        try {
            const { person_id, role } = req.user;

            const notifications = await NotificationService.getNotificationsIfExists(person_id, role);
            if (!notifications) {
                throw new AppError("No notifications found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: notifications,
                message: "Notifications retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in NotificationController.getNotificationsIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Fetch Notifications",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateNotificationIsRead(req, res) {
        try {
            const { person_id } = req.user;
            const { notification_id } = req.params;

            await NotificationService.updateNotificationIsRead(person_id, notification_id);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Notification marked as read",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in NotificationController.updateNotificationIsRead: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Mark Notification as Read",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateAllNotificationsIsRead(req, res) {
        try {
            const { person_id, role } = req.user;

            await NotificationService.updateAllNotificationsIsRead(person_id, role);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "All notifications marked as read",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in NotificationController.updateAllNotificationsIsRead: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Mark All Notifications as Read",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteNotification(req, res) {
        try {
            const { person_id } = req.user;
            const { notification_id } = req.params;

            await NotificationService.deleteNotification(person_id, notification_id);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Notification deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in NotificationController.deleteNotification: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Delete Notification",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteAllNotifications(req, res) {
        try {
            const { person_id, role } = req.user;

            await NotificationService.deleteAllNotifications(person_id, role);
            
            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "All notifications deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in NotificationController.deleteAllNotifications: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Delete All Notifications",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new NotificationController();