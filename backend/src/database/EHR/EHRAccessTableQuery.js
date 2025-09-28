const validEHRAccessStatuses = [
    'granted',
    'revoked'
];

const EHRAccessTable = `
    CREATE TABLE IF NOT EXISTS ehr_access (
        ehr_access_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctor(doctor_id) ON DELETE CASCADE,
        status VARCHAR(50) CHECK (status IN (${validEHRAccessStatuses.map(status => `'${status}'`).join(', ')})) DEFAULT 'granted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (patient_id, doctor_id)
    );
`;

module.exports = { validEHRAccessStatuses, EHRAccessTable };