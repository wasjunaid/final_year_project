const validAppointmentStatuses = [
    'upcoming',
    'in progress',
    'completed',
    'cancelled'
];

const appointmentTableQuery = `
    CREATE TABLE IF NOT EXISTS appointment (
        appointment_id INTEGER REFERENCES appointment_request(appointment_request_id) ON DELETE CASCADE PRIMARY KEY,
        status VARCHAR(11) CHECK (status IN (${validAppointmentStatuses.map(status => `'${status}'`).join(', ')})) DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { validAppointmentStatuses, appointmentTableQuery };