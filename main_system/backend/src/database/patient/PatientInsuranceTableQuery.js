const { INSURANCE_NUMBER_MAX_LENGTH, INSURANCE_POLICY_HOLDER_NAME_MAX_LENGTH, INSURANCE_RELATION_TO_HOLDER_MAX_LENGTH, VALID_INSURANCE_RELATION_TO_HOLDER } = require("../../utils/validConstantsUtil");

const patientInsuranceTableQuery = `
    CREATE TABLE IF NOT EXISTS patient_insurance (
        patient_insurance_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
        insurance_company_id INTEGER REFERENCES insurance_company(insurance_company_id) NOT NULL,
        insurance_number VARCHAR(${INSURANCE_NUMBER_MAX_LENGTH}) NOT NULL,
        policy_holder_name VARCHAR(${INSURANCE_POLICY_HOLDER_NAME_MAX_LENGTH}) NOT NULL,
        relationship_to_holder VARCHAR(${INSURANCE_RELATION_TO_HOLDER_MAX_LENGTH}) CHECK (relationship_to_holder IN (${VALID_INSURANCE_RELATION_TO_HOLDER.map(relation => `'${relation}'`).join(', ')})) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE NOT NULL,
        auto_renewal_enabled BOOLEAN DEFAULT FALSE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        effective_date DATE,
        expiration_date DATE CHECK (expiration_date > effective_date),
        last_renewed_at TIMESTAMP,
        deactivated_at TIMESTAMP,
        deactivation_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (patient_id, insurance_company_id, insurance_number)
    );

    ALTER TABLE patient_insurance
    ADD COLUMN IF NOT EXISTS auto_renewal_enabled BOOLEAN DEFAULT FALSE NOT NULL;

    ALTER TABLE patient_insurance
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

    ALTER TABLE patient_insurance
    ADD COLUMN IF NOT EXISTS last_renewed_at TIMESTAMP;

    ALTER TABLE patient_insurance
    ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;

    ALTER TABLE patient_insurance
    ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;

    DROP VIEW IF EXISTS patient_insurance_view;

    CREATE VIEW patient_insurance_view AS
    SELECT 
        pi.patient_insurance_id,
        pi.patient_id,
        pi.insurance_company_id,
        ic.name AS insurance_company_name,
        pi.insurance_number,
        pi.policy_holder_name,
        pi.relationship_to_holder,
        pi.is_primary,
        pi.is_verified,
        pi.auto_renewal_enabled,
        pi.is_active,
        pi.effective_date,
        pi.expiration_date,
        pi.last_renewed_at,
        pi.deactivated_at,
        pi.deactivation_reason
    FROM patient_insurance pi
    JOIN insurance_company ic ON pi.insurance_company_id = ic.insurance_company_id;

    CREATE INDEX IF NOT EXISTS idx_patient_primary_insurance 
    ON patient_insurance (patient_id) 
    WHERE is_primary = TRUE;
    CREATE INDEX IF NOT EXISTS idx_insurance_lookup 
    ON patient_insurance (insurance_company_id, insurance_number);

    DROP TRIGGER IF EXISTS trg_update_patient_insurance_updated_at ON patient_insurance;

    CREATE TRIGGER trg_update_patient_insurance_updated_at
    BEFORE UPDATE ON patient_insurance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { patientInsuranceTableQuery };