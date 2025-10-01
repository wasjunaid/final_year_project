const medicalCodingTableQuery = `
    CREATE TABLE IF NOT EXISTS medical_coding (
        medical_coding_id SERIAL PRIMARY KEY,
        doctor_note_id INTEGER REFERENCES doctor_note(doctor_note_id) ON DELETE CASCADE,
        icd_code VARCHAR(10) REFERENCES icd(icd_code) ON DELETE CASCADE,
        cpt_code VARCHAR(10) REFERENCES cpt(cpt_code) ON DELETE CASCADE,
        modifier_code VARCHAR(10) REFERENCES modifier(modifier_code) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { medicalCodingTableQuery };