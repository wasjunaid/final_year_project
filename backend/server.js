const express = require("express");
const cors = require("cors");
const { database } = require("./src/database/database");
const { createDefaultSuperAdmin } = require("./src/services/System/systemAdminService");
const { sendAppointmentReminders } = require("./src/services/Notification/NotificationService");
const { PORT } = require("./src/config/backendConfig");

const { routes } = require("./src/routes/routes");

const app = express();

database();

createDefaultSuperAdmin();

sendAppointmentReminders();

app.use(cors());
app.use(express.json());

routes(app);

app.listen(
    PORT,
    () => { console.log(`Server is running on PORT: ${PORT}`); }
);