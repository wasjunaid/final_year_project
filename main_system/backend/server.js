const express = require("express");
const cors = require("cors");
const { database } = require("./src/database/database");
const { createDefaultSuperAdmin } = require("./src/services/System/SystemAdminService");
const { sendAppointmentReminders } = require("./src/services/Notification/NotificationService");
const { PORT, ENABLE_APPOINTMENT_REMINDER_CRON } = require("./src/config/backendConfig");

const { routes } = require("./src/routes/routes");

const app = express();

const getReadableErrorMessage = (error) => {
    if (!error) {
        return "Unknown server initialization error";
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error.message && String(error.message).trim().length > 0) {
        return error.message;
    }

    if (Array.isArray(error.errors) && error.errors.length > 0) {
        return error.errors
            .map((err) => err?.message || String(err))
            .filter(Boolean)
            .join(' | ');
    }

    if (error.code) {
        return `Server error code: ${error.code}`;
    }

    return "Unknown server initialization error";
};

const serverInit = async () => {
    try {
        await database();
        await createDefaultSuperAdmin();
        if (ENABLE_APPOINTMENT_REMINDER_CRON) {
            await sendAppointmentReminders();
            console.log("Appointment reminder cron enabled");
        }

        app.use(cors({
            origin: 'http://localhost:5173', // Frontend URL
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        app.use(express.json());

        routes(app);

        app.listen(
            PORT,
            () => {
                console.log(`Server is running on PORT: ${PORT}`);
            }
        );
    } catch (error) {
        console.error(`Error during server initialization: ${getReadableErrorMessage(error)}`);
        process.exit(1);
    }
}

serverInit();