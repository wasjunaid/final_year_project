const validEHRAccessRequestStatuses = [
    'requested',
    'approved',
    'denied',
    'revoked',
    're-requested'
];

const EHRAccessRequestTable = `
    CREATE TABLE IF NOT EXISTS ehr_access_request (
        ehr_access_request_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctor(doctor_id) ON DELETE CASCADE,
        status VARCHAR(50) CHECK (status IN (${validEHRAccessRequestStatuses.map(status => `'${status}'`).join(', ')})) DEFAULT 'requested',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (patient_id, doctor_id)
    );
`;

module.exports = { validEHRAccessRequestStatuses, EHRAccessRequestTable };