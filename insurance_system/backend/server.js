const express = require("express");
const cors = require("cors");
const { database } = require("./src/database/database");
const { createDefaultSuperAdmin } = require("./src/services/System/superAdminService");
const { PORT } = require("./src/config/backendConfig");

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

const startServer = async () => {
    try {
        await database();

        await createDefaultSuperAdmin();

        app.use(cors({
            origin: 'http://localhost:6173',
            credentials: true
        }));
        app.use(express.json());

        routes(app);

        app.listen(
            PORT,
            () => { console.log(`Insurance Server is running on PORT: ${PORT}`); }
        );
    } catch (error) {
        console.error(`Error Starting Server: ${getReadableErrorMessage(error)}`);
        process.exit(1);
    }
}

startServer();