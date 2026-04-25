const { INSURANCE_PLAN_NAME_MAX_LENGTH } = require('../../utils/validConstantsUtil');

const insurancePlanTableQuery = `
    CREATE TABLE IF NOT EXISTS insurance_plan (
        insurance_plan_id SERIAL PRIMARY KEY,
        name VARCHAR(${INSURANCE_PLAN_NAME_MAX_LENGTH}) NOT NULL,
        description TEXT NOT NULL,
        coverage_amount NUMERIC(10, 2) NOT NULL,
        number_of_persons INTEGER NOT NULL CHECK (number_of_persons > 0),
        insurance_company_id INTEGER REFERENCES insurance_company(insurance_company_id) ON DELETE CASCADE,
        UNIQUE (name, coverage_amount, number_of_persons, insurance_company_id)
    );
`;

module.exports = { insurancePlanTableQuery };