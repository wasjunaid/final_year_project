const { CNIC_MAX_LENGTH, INSURANCE_NUMBER_MAX_LENGTH, VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER, VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER_OBJECT, PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER_MAX_LENGTH } = require("../../utils/validConstantsUtil");

const personInsuranceTableQuery = `
    CREATE TABLE IF NOT EXISTS person_insurance (
        person_insurance_id SERIAL PRIMARY KEY,
        cnic VARCHAR(${CNIC_MAX_LENGTH}) REFERENCES person(cnic) ON DELETE CASCADE,
        insurance_number VARCHAR(${INSURANCE_NUMBER_MAX_LENGTH}) REFERENCES insurance(insurance_number) ON DELETE CASCADE,
        relationship_to_holder VARCHAR(${PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER_MAX_LENGTH}) CHECK (relationship_to_holder IN (${VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER.map(rel => `'${rel}'`).join(", ")})) NOT NULL DEFAULT '${VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER_OBJECT.SELF}',
        UNIQUE (cnic, insurance_number)
    );

    DROP VIEW IF EXISTS person_insurance_view;

    CREATE VIEW person_insurance_view AS
    SELECT
        pi.person_insurance_id,
        pi.cnic,
        p.first_name,
        p.last_name,
        pi.insurance_number,
        pi.relationship_to_holder,
        i.insurance_plan_id,
        i.policy_holder_name,
        i.start_date,
        i.end_date,
        i.amount_remaining,
        ip.insurance_company_id,
        ip.name AS plan_name,
        ip.description AS plan_description,
        ip.coverage_amount,
        ip.number_of_persons,
        ic.name AS insurance_company_name
    FROM person_insurance pi
    JOIN person p ON pi.cnic = p.cnic
    JOIN insurance i ON pi.insurance_number = i.insurance_number
    JOIN insurance_plan ip ON i.insurance_plan_id = ip.insurance_plan_id
    JOIN insurance_company ic ON ip.insurance_company_id = ic.insurance_company_id;
`;

module.exports = { personInsuranceTableQuery };