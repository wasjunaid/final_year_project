const validDoctorStatuses = [
    'active',
    'on leave'
];

const doctorTableQuery = `
    CREATE TABLE IF NOT EXISTS doctor (
        doctor_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE PRIMARY KEY,
        license_number VARCHAR(50) UNIQUE,
        specialization VARCHAR(255),
        years_of_experience INTEGER,
        sitting_start TIME,
        sitting_end TIME,
        status VARCHAR(50) CHECK (status IN (${validDoctorStatuses.map(status => `'${status}'`).join(', ')})) DEFAULT 'active',
        hospital_id INTEGER REFERENCES hospital(hospital_id) ON DELETE CASCADE DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { validDoctorStatuses, doctorTableQuery };