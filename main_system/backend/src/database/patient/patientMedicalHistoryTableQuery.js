const patientMedicalHistoryTableQuery = `
    CREATE TABLE IF NOT EXISTS patient_medical_history (
        patient_medical_history_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
        condition_name VARCHAR(255) NOT NULL,
        diagnosis_date DATE DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unique(patient_id, condition_name, diagnosis_date)
    );
`;

module.exports = { patientMedicalHistoryTableQuery };