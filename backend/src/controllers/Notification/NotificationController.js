const { NotificationService } = require("../../services/Notification/NotificationService");
const { statusCodes } = require("../../utils/statusCodesUtil");

class NotificationController {
    async getNotifications(req, res) {
        const { person_id, role } = req.user;

        try {
            const notifications = await NotificationService.getNotifications(person_id, role);

            res.status(statusCodes.OK).json({
                data: notifications,
                message: "Notifications retrieved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Fetch Notifications",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateNotificationIsRead(req, res) {
        const { notification_id } = req.params;
        const { person_id } = req.user;

        try {
            await NotificationService.updateNotificationIsRead(notification_id, person_id);

            res.status(statusCodes.OK).json({
                data: null,
                message: "Notification marked as read",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Mark Notification as Read",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateAllNotificationsIsRead(req, res) {
        const { person_id, role } = req.user;

        try {
            await NotificationService.updateAllNotificationsIsRead(person_id, role);

            res.status(statusCodes.OK).json({
                data: null,
                message: "All notifications marked as read",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Mark All Notifications as Read",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteNotification(req, res) {
        const { notification_id } = req.params;
        const { person_id } = req.user;

        try {
            await NotificationService.deleteNotification(notification_id, person_id);

            res.status(statusCodes.OK).json({
                data: null,
                message: "Notification deleted successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error("Error deleting notification:", error);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Delete Notification",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteAllNotifications(req, res) {
        const { person_id, role } = req.user;

        try {
            await NotificationService.deleteAllNotifications(person_id, role);

            res.status(statusCodes.OK).json({
                data: null,
                message: "All notifications deleted successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error("Error deleting all notifications:", error);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Delete All Notifications",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new NotificationController();