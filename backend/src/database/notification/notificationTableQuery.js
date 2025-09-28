const notificationTableQuery = `
    CREATE TABLE IF NOT EXISTS notification (
        notification_id SERIAL PRIMARY KEY,
        person_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        role VARCHAR(25) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_id INTEGER,
        related_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { notificationTableQuery };