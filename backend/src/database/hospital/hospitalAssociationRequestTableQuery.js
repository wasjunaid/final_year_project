const validHospitalAssociationRequestRoles = [
    'doctor',
    'medical coder'
];

const hospitalAssociationRequestTableQuery = `
    CREATE TABLE IF NOT EXISTS hospital_association_request (
        hospital_association_request_id SERIAL PRIMARY KEY,
        hospital_id INT NOT NULL,
        person_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        role VARCHAR(50) CHECK (role IN (${validHospitalAssociationRequestRoles.map(role => `'${role}'`).join(', ')})) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { validHospitalAssociationRequestRoles, hospitalAssociationRequestTableQuery };