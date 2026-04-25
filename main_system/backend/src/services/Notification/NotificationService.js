const cron = require("node-cron");
const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const {
    validateIDFieldsForNotification,
    validateIDandRoleFieldsForNotification,
    validateFieldsForInsertNotification
} = require("../../validations/notification/notificationValidations");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const { EmailService } = require("../Email/EmailService");
const { UpcomingAppointmentService } = require("../Appointment/UpcomingAppointmentService");

class NotificationService {
    /**
     * Retrieves notifications for a person if any exist.
     * @param {number} person_id - The ID of the person.
     * @param {string} role - The role of the person (e.g., 'doctor', 'patient', 'admin').
     * @returns {Promise<Array|boolean>} Array of notification objects or false if none exist.
     * @throws {AppError} if any issue occurs
     */
    static async getNotificationsIfExists(person_id, role) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ person_id, role } = validateIDandRoleFieldsForNotification({ person_id, role }));

            const query = {
                text: `SELECT * FROM notification_view
                WHERE
                person_id = $1
                AND (role = $2 OR role = '${VALID_ROLES_OBJECT.PERSON}')
                ORDER BY created_at DESC
                LIMIT 50`,
                values: [person_id, role]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in NotificationService.getNotificationsIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new notification into the database.
     * @param {Object} params - The notification parameters.
     * @param {number} params.person_id - The ID of the person to notify.
     * @param {string} params.role - The role of the person (e.g., 'doctor', 'patient', 'admin').
     * @param {string} params.title - The title of the notification.
     * @param {string} params.message - The message of the notification.
     * @param {string} params.type - The type of the notification (e.g., 'Reminder', 'Alert').
     * @param {number} params.related_id - The ID of the related entity (e.g., appointment ID).
     * @param {string} params.related_table - The table of the related entity (e.g., 'appointment').
     * @param {string} params.email - The email address to send the notification to.
     * @param {boolean} params.sendEmail - Whether to send an email notification.
     * @returns {Promise<Object>} The inserted notification object.
     * @throws {AppError} if any issue occurs
     */
    static async insertNotification({person_id, role, title, message, type, related_id, related_table, email, sendEmail
    , preventDuplicates = false, dedupeWindowHours = 24 }) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!title) {
                throw new AppError("title is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!message) {
                throw new AppError("message is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!type) {
                throw new AppError("type is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!related_id) {
                throw new AppError("related_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!related_table) {
                throw new AppError("related_table is required", STATUS_CODES.BAD_REQUEST);
            }
            
            if (sendEmail === undefined) {
                throw new AppError("sendEmail is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ person_id, role, title, message, type, related_id, related_table, email, sendEmail } = validateFieldsForInsertNotification({ person_id, role, title, message, type, related_id, related_table, email, sendEmail }));

            if (preventDuplicates) {
                const duplicateQuery = {
                    text: `SELECT notification_id FROM notification
                    WHERE
                    person_id = $1
                    AND role = $2
                    AND title = $3
                    AND message = $4
                    AND type = $5
                    AND related_id = $6
                    AND related_table = $7
                    AND created_at >= NOW() - ($8::text || ' hours')::interval
                    LIMIT 1`,
                    values: [
                        person_id,
                        role,
                        title,
                        message,
                        type,
                        related_id,
                        related_table,
                        Math.max(1, Number(dedupeWindowHours) || 24),
                    ],
                };

                const duplicateResult = await DatabaseService.query(duplicateQuery.text, duplicateQuery.values);
                if (duplicateResult.rowCount > 0) {
                    return { notification_id: duplicateResult.rows[0].notification_id, duplicate: true };
                }
            }

            const query = {
                text: `INSERT INTO notification
                (person_id, role, title, message, type, related_id, related_table)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                values: [person_id, role, title, message, type, related_id, related_table]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to create notification", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            if (sendEmail) {
                await EmailService.sendNotificationEmail({
                    email,
                    title,
                    message,
                    type
                });
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in NotificationService.insertNotification: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Updates the is_read status of a notification for a specific person.
     * @param {number} person_id - The ID of the person.
     * @param {number} notification_id - The ID of the notification.
     * @returns {Promise<Object>} The updated notification object.
     * @throws {AppError} if any issue occurs
     */
    static async updateNotificationIsRead(person_id, notification_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!notification_id) {
                throw new AppError("notification_id is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ person_id, notification_id } = validateIDFieldsForNotification({ person_id, notification_id }));

            const query = {
                text: `UPDATE notification
                SET
                is_read = true
                WHERE
                notification_id = $1 AND person_id = $2
                RETURNING *`,
                values: [notification_id, person_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to update notification", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in NotificationService.updateNotificationIsRead: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Marks all notifications as read for a specific person and role.
     * @param {number} person_id - The ID of the person.
     * @param {string} role - The role of the person (e.g., 'doctor', 'patient', 'admin').
     * @returns {Promise<boolean>} true if successful.
     * @throws {AppError} if any issue occurs
     */
    static async updateAllNotificationsIsRead(person_id, role) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ person_id, role } = validateIDandRoleFieldsForNotification({ person_id, role }));

            const query = {
                text: `UPDATE notification
                SET
                is_read = true
                WHERE
                person_id = $1
                AND is_read = false
                AND (role = $2 OR role = '${VALID_ROLES_OBJECT.PERSON}')`,
                values: [person_id, role]
            };
            await DatabaseService.query(query.text, query.values);

            return true;
        } catch (error) {
            console.error(`Error in NotificationService.updateAllNotificationsIsRead: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Deletes a notification for a specific person.
     * @param {number} person_id - The ID of the person.
     * @param {number} notification_id - The ID of the notification.
     * @returns {Promise<Object>} The deleted notification object.
     * @throws {AppError} if any issue occurs
     */
    static async deleteNotification(person_id, notification_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!notification_id) {
                throw new AppError("notification_id is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ person_id, notification_id } = validateIDFieldsForNotification({ person_id, notification_id }));

            const query = {
                text: `DELETE FROM notification
                WHERE
                notification_id = $1
                AND person_id = $2
                RETURNING *`,
                values: [notification_id, person_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to delete notification", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in NotificationService.deleteNotification: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Deletes all notifications for a specific person and role.
     * @param {number} person_id - The ID of the person.
     * @param {string} role - The role of the person (e.g., 'doctor', 'patient', 'admin').
     * @returns {Promise<boolean>} true if successful.
     * @throws {AppError} if any issue occurs
     */
    static async deleteAllNotifications(person_id, role) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ person_id, role } = validateIDandRoleFieldsForNotification({ person_id, role }));

            const query = {
                text: `DELETE FROM notification
                WHERE
                person_id = $1
                AND (role = $2 OR role = '${VALID_ROLES_OBJECT.PERSON}')`,
                values: [person_id, role]
            };
            await DatabaseService.query(query.text, query.values);

            return true;
        } catch (error) {
            console.error(`Error in NotificationService.deleteAllNotifications: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts notifications for all upcoming appointments (today and tomorrow).
     * @returns {Promise<boolean>} true if successful.
     * @throws {AppError} if any issue occurs
     */
    static async insertNotificationsForUpcomingAppointments() {
        try {
            const appointments = await UpcomingAppointmentService.getUpcomingAppointmentsIfExists();
            if (!appointments) {
                return true;
            }
            
            for (const appointment of appointments) {
                const today = new Date();
                const todayDate = today.toISOString().split("T")[0];
                
                const day = appointment.date === todayDate
                ? "today"
                : "tomorrow";

                await this.insertNotification({
                    person_id: appointment.patient_id,
                    role: "patient",
                    title: "Appointment Reminder",
                    message: `Reminder: You have an appointment with Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name} ${day} at ${appointment.time}.`,
                    type: "Reminder",
                    related_id: appointment.appointment_id,
                    related_table: "appointment",
                    email: appointment.patient_email,
                    sendEmail: true,
                    preventDuplicates: true,
                    dedupeWindowHours: 36,
                });

                await this.insertNotification({
                    person_id: appointment.doctor_id,
                    role: "doctor",
                    title: "Appointment Reminder",
                    message: `Reminder: You have an appointment with ${appointment.patient_first_name} ${appointment.patient_last_name} ${day} at ${appointment.time}.`,
                    type: "Reminder",
                    related_id: appointment.appointment_id,
                    related_table: "appointment",
                    email: appointment.doctor_email,
                    sendEmail: true,
                    preventDuplicates: true,
                    dedupeWindowHours: 36,
                });
            }

            return true;
        } catch (error) {
            console.error(`Error in NotificationService.insertNotificationsForUpcomingAppointments: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

/**
 * Schedules a cron job to send appointment reminders daily at midnight.
 * @returns {void}
 */
const sendAppointmentReminders = async () => {
    return cron.schedule("0 0 * * *", async () => { // Runs every day at midnight 00 min 00 hour * day of month * month * any day of week
    try {
        await NotificationService.insertNotificationsForUpcomingAppointments();

        console.log("Appointment reminders sent successfully.");
    } catch (error) {
        console.error(`Error in NotificationService.sendAppointmentReminders: ${error.message} ${error.status}`);
    }
  });
};

module.exports = {
    NotificationService,
    sendAppointmentReminders
};