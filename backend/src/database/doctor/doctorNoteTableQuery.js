const doctorNoteTableQuery = `
    CREATE TABLE IF NOT EXISTS doctor_note (
        doctor_note_id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointment(appointment_id) ON DELETE CASCADE,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { doctorNoteTableQuery };