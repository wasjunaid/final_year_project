const patientSurgicalHistoryTableQuery = `
    CREATE TABLE IF NOT EXISTS patient_surgical_history (
        patient_surgical_history_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
        surgery_name VARCHAR(255) NOT NULL,
        surgery_date DATE DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unique(patient_id, surgery_name, surgery_date)
    );
`;

module.exports = { patientSurgicalHistoryTableQuery };