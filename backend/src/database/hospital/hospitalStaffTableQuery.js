const validHospitalStaffRoles = [
    'admin',
    'sub admin',
    'front desk',
    'lab technician'
];

const hospitalStaffTableQuery = `
    CREATE TABLE IF NOT EXISTS hospital_staff (
        hospital_staff_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE PRIMARY KEY,
        hospital_id INTEGER REFERENCES hospital(hospital_id) ON DELETE CASCADE,
        role VARCHAR(100) CHECK (role IN (${validHospitalStaffRoles.map(role => `'${role}'`).join(', ')})) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { validHospitalStaffRoles, hospitalStaffTableQuery };