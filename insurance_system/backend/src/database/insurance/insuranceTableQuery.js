const { INSURANCE_NUMBER_MIN_LENGTH, INSURANCE_NUMBER_MAX_LENGTH, INSURANCE_POLICY_HOLDER_NAME_MAX_LENGTH } = require('../../utils/validConstantsUtil');

const insuranceTableQuery = `
    CREATE TABLE IF NOT EXISTS insurance (
        insurance_number VARCHAR(${INSURANCE_NUMBER_MAX_LENGTH}) PRIMARY KEY CHECK (LENGTH(insurance_number) >= ${INSURANCE_NUMBER_MIN_LENGTH} AND LENGTH(insurance_number) <= ${INSURANCE_NUMBER_MAX_LENGTH}),
        insurance_plan_id INTEGER REFERENCES insurance_plan(insurance_plan_id) ON DELETE CASCADE,
        policy_holder_name VARCHAR(${INSURANCE_POLICY_HOLDER_NAME_MAX_LENGTH}) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL CHECK (end_date > start_date),
        amount_remaining NUMERIC(10, 2) NOT NULL CHECK (amount_remaining >= 0)
    );

    DROP VIEW IF EXISTS insurance_view;

    CREATE VIEW insurance_view AS
    SELECT
        i.insurance_number,
        i.insurance_plan_id,
        ip.name AS plan_name,
        ip.description AS plan_description,
        ip.coverage_amount,
        ip.number_of_persons,
        ic.insurance_company_id,
        ic.name AS insurance_company_name,
        i.policy_holder_name,
        i.start_date,
        i.end_date,
        i.amount_remaining
    FROM insurance i
    JOIN insurance_plan ip ON i.insurance_plan_id = ip.insurance_plan_id
    JOIN insurance_company ic ON ip.insurance_company_id = ic.insurance_company_id;
`;

module.exports = { insuranceTableQuery };