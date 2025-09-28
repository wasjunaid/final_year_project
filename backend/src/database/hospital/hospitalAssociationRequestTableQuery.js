const validHospitalAssociationRoles = [
    'doctor',
    'medical coder'
];

const hospitalAssociationRequestTableQuery = `
    CREATE TABLE IF NOT EXISTS hospital_association_requests (
        hospital_association_request_id SERIAL PRIMARY KEY,
        hospital_id INT NOT NULL,
        person_id INTEGER REFERENCES persons(person_id) ON DELETE CASCADE,
        role VARCHAR(50) CHECK (role IN (${validHospitalAssociationRoles.map(role => `'${role}'`).join(', ')})) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { validHospitalAssociationRoles, hospitalAssociationRequestTableQuery };