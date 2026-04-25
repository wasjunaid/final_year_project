const { HOSPITAL_STAFF_ROLES_MAX_LENGTH, VALID_HOSPITAL_STAFF_ROLES } = require("../../utils/validConstantsUtil");

const hospitalStaffTableQuery = `
    CREATE TABLE IF NOT EXISTS hospital_staff (
        hospital_staff_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE PRIMARY KEY,
        hospital_id INTEGER REFERENCES hospital(hospital_id) ON DELETE CASCADE,
        role VARCHAR(${HOSPITAL_STAFF_ROLES_MAX_LENGTH}) CHECK (role IN (${VALID_HOSPITAL_STAFF_ROLES.map(role => `'${role}'`).join(', ')})) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DROP VIEW IF EXISTS hospital_staff_view;

    CREATE VIEW hospital_staff_view AS
    SELECT 
        hs.hospital_staff_id,
        hs.hospital_id,
        hs.role,
        h.name as hospital_name
    FROM hospital_staff hs
    JOIN hospital h ON hs.hospital_id = h.hospital_id;

    CREATE INDEX IF NOT EXISTS idx_hospital_staff_hospital_staff_id ON hospital_staff(hospital_staff_id);
    CREATE INDEX IF NOT EXISTS idx_hospital_staff_hospital_id ON hospital_staff(hospital_id);
    CREATE INDEX IF NOT EXISTS idx_hospital_staff_role ON hospital_staff(role);
`;

module.exports = { hospitalStaffTableQuery };