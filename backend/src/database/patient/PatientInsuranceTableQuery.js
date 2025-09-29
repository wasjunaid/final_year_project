const patientInsuranceTableQuery = `
    CREATE TABLE IF NOT EXISTS patient_insurance (
        patient_insurance_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
        insurance_number INTEGER REFERENCES insurance(insurance_number) ON DELETE CASCADE,
        is_primary BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { patientInsuranceTableQuery };