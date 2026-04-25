const patientFamilyHistoryTableQuery = `
    CREATE TABLE IF NOT EXISTS patient_family_history (
        patient_family_history_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
        condition_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unique(patient_id, condition_name)
    );
`;

module.exports = { patientFamilyHistoryTableQuery };