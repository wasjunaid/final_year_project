const { pool } = require("../../config/databaseConfig");
const { EmailService } = require("../Email/EmailService");
const { UpcomingAppointmentService } = require("../Appointment/UpcomingAppointmentService");
const cron = require("node-cron");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class NotificationService {
    static async getNotifications(person_id, role) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT
                notification_id,
                title,
                message,
                type,
                is_read,
                related_id,
                related_type,
                TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as created_at
                FROM notification
                WHERE
                (person_id = $1
                AND (role = $2 OR role = 'person'))
                ORDER BY created_at DESC
                LIMIT 50`,
                values: [person_id, role]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No notifications found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting notifications: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertNotification(person_id, {
        role,
        title,
        message,
        type,
        related_id,
        related_type,
        email,
        sendEmail
    }) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }
        if (!title) {
            throw new AppError("title is required", statusCodes.BAD_REQUEST);
        }
        if (!message) {
            throw new AppError("message is required", statusCodes.BAD_REQUEST);
        }
        if (!type) {
            throw new AppError("type is required", statusCodes.BAD_REQUEST);
        }
        if (!related_id) {
            throw new AppError("related_id is required", statusCodes.BAD_REQUEST);
        }
        if (!related_type) {
            throw new AppError("related_type is required", statusCodes.BAD_REQUEST);
        }
        if (sendEmail === undefined) {
            throw new AppError("sendEmail is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `INSERT INTO notification
                (person_id, role, title, message, type, related_id, related_type)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                values: [person_id, role, title, message, type, related_id, related_type]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to create notification", statusCodes.INTERNAL_SERVER_ERROR);
            }

            if (sendEmail) {
                await EmailService.sendNotificationEmail(email, {
                    title: title,
                    message: message,
                    type: type
                });
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting notification: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updateNotificationIsRead(notification_id, person_id) {
        if (!notification_id) {
            throw new AppError("notification_id is required", statusCodes.BAD_REQUEST);
        }
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `UPDATE notification
                SET is_read = true,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                notification_id = $1 AND person_id = $2`,
                values: [notification_id, person_id]
            };
            await pool.query(query);
        } catch (error) {
            console.error(`Error updating notification is read: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updateAllNotificationsIsRead(person_id, role) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `UPDATE notification
                SET is_read = true,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                person_id = $1
                AND is_read = false
                AND (role = $2 OR role = 'person')`,
                values: [person_id, role]
            };
            await pool.query(query);
        } catch (error) {
            console.error(`Error updating all notifications is read: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deleteNotification(notification_id, person_id) {
        if (!notification_id) {
            throw new AppError("notification_id is required", statusCodes.BAD_REQUEST);
        }
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM notification
                WHERE
                notification_id = $1
                AND person_id = $2`,
                values: [notification_id, person_id]
            };
            await pool.query(query);
        } catch (error) {
            console.error(`Error deleting notification: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deleteAllNotifications(person_id, role) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM notification
                WHERE
                person_id = $1
                AND (role = $2 OR role = 'person')`,
                values: [person_id, role]
            };
            await pool.query(query);
        } catch (error) {
            console.error(`Error deleting all notifications: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertNotificationsForUpcomingAppointments() {
        try {
            const appointments = await UpcomingAppointmentService.getUpcomingAppointments();
            if (appointments.length === 0) {
                throw new AppError("No upcoming appointments found", statusCodes.NOT_FOUND);
            }
            
            for (const appointment of appointments) {
                const today = new Date();
                const todayDate = today.toISOString().split("T")[0];
                
                const day = appointment.date === todayDate
                ? "today"
                : "tomorrow";

                await this.insertNotification(appointment.patient_id, {
                    role: "patient",
                    title: "Appointment Reminder",
                    message: `Reminder: You have an appointment with Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name} ${day} at ${appointment.time}.`,
                    type: "Reminder",
                    related_id: appointment.appointment_id,
                    related_type: "appointment",
                    email: appointment.patient_email,
                    sendEmail: true
                });

                await this.insertNotification(appointment.doctor_id, {
                    role: "doctor",
                    title: "Appointment Reminder",
                    message: `Reminder: You have an appointment with ${appointment.patient_first_name} ${appointment.patient_last_name} ${day} at ${appointment.time}.`,
                    type: "Reminder",
                    related_id: appointment.appointment_id,
                    related_type: "appointment",
                    email: appointment.doctor_email,
                    sendEmail: true
                });
            }
        } catch (error) {
            console.error(`Error inserting notifications for upcoming appointments: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

const sendAppointmentReminders = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
        await NotificationService.insertNotificationsForUpcomingAppointments();
    } catch (error) {
        console.error(`Error sending appointment reminders: ${error.message} ${error.status}`);
    }
  });
};

module.exports = { NotificationService, sendAppointmentReminders };