const {
    INSURANCE_COMPANY_NAME_MAX_LENGTH,
    FOCAL_PERSON_NAME_MAX_LENGTH,
    FOCAL_PERSON_EMAIL_MAX_LENGTH,
    FOCAL_PERSON_PHONE_MAX_LENGTH,
    ORGANIZATION_ADDRESS_MAX_LENGTH,
} = require("../../utils/validConstantsUtil");

const insuranceCompanyTableQuery = `
    CREATE TABLE IF NOT EXISTS insurance_company (
        insurance_company_id SERIAL PRIMARY KEY,
        name VARCHAR(${INSURANCE_COMPANY_NAME_MAX_LENGTH}) NOT NULL UNIQUE,
        focal_person_name VARCHAR(${FOCAL_PERSON_NAME_MAX_LENGTH}),
        focal_person_email VARCHAR(${FOCAL_PERSON_EMAIL_MAX_LENGTH}),
        focal_person_phone VARCHAR(${FOCAL_PERSON_PHONE_MAX_LENGTH}),
        address VARCHAR(${ORGANIZATION_ADDRESS_MAX_LENGTH}),
        wallet_address VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE insurance_company ADD COLUMN IF NOT EXISTS focal_person_name VARCHAR(${FOCAL_PERSON_NAME_MAX_LENGTH});
    ALTER TABLE insurance_company ADD COLUMN IF NOT EXISTS focal_person_email VARCHAR(${FOCAL_PERSON_EMAIL_MAX_LENGTH});
    ALTER TABLE insurance_company ADD COLUMN IF NOT EXISTS focal_person_phone VARCHAR(${FOCAL_PERSON_PHONE_MAX_LENGTH});
    ALTER TABLE insurance_company ADD COLUMN IF NOT EXISTS address VARCHAR(${ORGANIZATION_ADDRESS_MAX_LENGTH});
    ALTER TABLE insurance_company ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255);

    CREATE INDEX IF NOT EXISTS idx_insurance_company_insurance_company_id ON insurance_company(insurance_company_id);
    CREATE INDEX IF NOT EXISTS idx_insurance_company_name ON insurance_company(name);

    DROP TRIGGER IF EXISTS trg_update_insurance_company_updated_at ON insurance_company;

    CREATE TRIGGER trg_update_insurance_company_updated_at
    BEFORE UPDATE ON insurance_company
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { insuranceCompanyTableQuery };
