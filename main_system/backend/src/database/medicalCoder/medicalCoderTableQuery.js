const medicalCoderTableQuery = `
    CREATE TABLE IF NOT EXISTS medical_coder (
        medical_coder_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { medicalCoderTableQuery };