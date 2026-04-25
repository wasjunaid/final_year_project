const { HOSPITAL_ASSOCIATION_REQUEST_ROLES_MAX_LENGTH, VALID_HOSPITAL_ASSOCIATION_REQUEST_ROLES } = require("../../utils/validConstantsUtil");

const hospitalAssociationRequestTableQuery = `
    CREATE TABLE IF NOT EXISTS hospital_association_request (
        hospital_association_request_id SERIAL PRIMARY KEY,
        hospital_id INTEGER REFERENCES hospital(hospital_id) ON DELETE CASCADE,
        person_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        role VARCHAR(${HOSPITAL_ASSOCIATION_REQUEST_ROLES_MAX_LENGTH}) CHECK (role IN (${VALID_HOSPITAL_ASSOCIATION_REQUEST_ROLES
          .map((role) => `'${role}'`)
          .join(", ")})) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(hospital_id, person_id, role)
    );

    CREATE INDEX IF NOT EXISTS idx_hospital_association_request_hospital_id ON hospital_association_request(hospital_id);
    CREATE INDEX IF NOT EXISTS idx_hospital_association_request_person_id ON hospital_association_request(person_id);
    CREATE INDEX IF NOT EXISTS idx_hospital_association_request_role ON hospital_association_request(role);
`;

module.exports = { hospitalAssociationRequestTableQuery };
