const validAppointmentRequestStatuses = [
    'processing',
    'denied',
    'approved',
    'cancelled'
];

const appointmentRequestTableQuery = `
    CREATE TABLE IF NOT EXISTS appointment_request (
        appointment_request_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        hospital_id INTEGER REFERENCES hospital(hospital_id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctor(doctor_id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time TIME NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(10) CHECK (status IN (${validAppointmentRequestStatuses.map(status => `'${status}'`).join(', ')})) DEFAULT 'processing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { validAppointmentRequestStatuses, appointmentRequestTableQuery };