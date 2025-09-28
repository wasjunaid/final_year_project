const patientTableQuery = `
    CREATE TABLE IF NOT EXISTS patient (
        patient_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { patientTableQuery };