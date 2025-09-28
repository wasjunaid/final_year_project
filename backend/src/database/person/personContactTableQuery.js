const personContactTableQuery = `
    CREATE TABLE IF NOT EXISTS person_contact (
        person_contact_id SERIAL PRIMARY KEY,
        person_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        contact_id INTEGER REFERENCES contact(contact_id) ON DELETE CASCADE,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { personContactTableQuery };