const patientAllergyTableQuery = `
    CREATE TABLE IF NOT EXISTS patient_allergy (
        patient_allergy_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
        allergy_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unique(patient_id, allergy_name)
    );
`;

module.exports = { patientAllergyTableQuery };