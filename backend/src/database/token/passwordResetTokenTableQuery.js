const passwordResetTokenTableQuery = `
    CREATE TABLE IF NOT EXISTS password_reset_token (
        person_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE PRIMARY KEY,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { passwordResetTokenTableQuery };