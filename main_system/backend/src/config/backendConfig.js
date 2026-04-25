require("dotenv").config();

const PORT = process.env.PORT || 5000;
const ENABLE_APPOINTMENT_REMINDER_CRON = (process.env.ENABLE_APPOINTMENT_REMINDER_CRON || "false").toLowerCase() === "true";

const superAdmin = {
    email: process.env.SUPER_ADMIN_EMAIL || "",
    password: process.env.SUPER_ADMIN_PASSWORD || ""
}

module.exports = { PORT, superAdmin, ENABLE_APPOINTMENT_REMINDER_CRON };