const { INSURANCE_STAFF_ROLES_MAX_LENGTH, VALID_INSURANCE_STAFF_ROLES } = require("../../utils/validConstantsUtil");

const insuranceStaffTableQuery = `
    CREATE TABLE IF NOT EXISTS insurance_staff (
        insurance_staff_id INTEGER REFERENCES "user"(user_id) ON DELETE CASCADE PRIMARY KEY,
        insurance_company_id INTEGER REFERENCES insurance_company(insurance_company_id) ON DELETE CASCADE,
        role VARCHAR(${INSURANCE_STAFF_ROLES_MAX_LENGTH}) CHECK (role IN (${VALID_INSURANCE_STAFF_ROLES.map(role => `'${role}'`).join(", ")})) NOT NULL
    );

    DROP VIEW IF EXISTS insurance_staff_view;

    CREATE VIEW insurance_staff_view AS
    SELECT
        u.user_id,
        u.email,
        ins.insurance_staff_id,
        ins.role AS insurance_staff_role,
        ic.insurance_company_id,
        ic.name AS insurance_company_name
    FROM insurance_staff ins
    JOIN "user" u ON ins.insurance_staff_id = u.user_id
    JOIN insurance_company ic ON ins.insurance_company_id = ic.insurance_company_id;
`;

module.exports = { insuranceStaffTableQuery };