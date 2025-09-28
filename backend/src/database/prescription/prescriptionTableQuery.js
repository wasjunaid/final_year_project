const prescriptionTableQuery = `
    CREATE TABLE IF NOT EXISTS prescription (
        prescription_id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointment(appointment_id) ON DELETE CASCADE,
        medicine_id INTEGER REFERENCES medicine(medicine_id) ON DELETE CASCADE,
        dosage VARCHAR(255) NOT NULL,
        instruction TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { prescriptionTableQuery };