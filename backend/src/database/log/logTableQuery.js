const logTableQuery = `
    CREATE TABLE IF NOT EXISTS log (
        log_id SERIAL PRIMARY KEY,
        person_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { logTableQuery };