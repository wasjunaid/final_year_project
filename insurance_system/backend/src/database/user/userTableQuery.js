const { EMAIL_CONFIG } = require("../../utils/emailUtil");

const userTableQuery = `
    CREATE TABLE IF NOT EXISTS "user" (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(${EMAIL_CONFIG.MAX_LENGTH}) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    );

    DROP VIEW IF EXISTS user_view;

    CREATE VIEW user_view AS
    SELECT
        u.user_id,
        u.email
    FROM "user" u;

    CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
`

module.exports = { userTableQuery };