const logTableQuery = `
    CREATE TABLE IF NOT EXISTS log (
        log_id SERIAL PRIMARY KEY,
        person_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DROP VIEW IF EXISTS log_view;

    CREATE VIEW log_view AS
    SELECT 
        lg.log_id,
        lg.person_id,
        lg.action,
        TO_CHAR(lg.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        p.first_name,
        p.last_name,
        p.email
    FROM log lg
    JOIN person p ON lg.person_id = p.person_id;

    CREATE INDEX IF NOT EXISTS idx_log_log_id ON log(log_id);
    CREATE INDEX IF NOT EXISTS idx_log_person_id ON log(person_id);
    CREATE INDEX IF NOT EXISTS idx_log_created_at ON log(created_at);
`;

module.exports = { logTableQuery };