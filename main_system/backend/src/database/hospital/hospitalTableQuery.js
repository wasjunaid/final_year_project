const {
    HOSPITAL_NAME_MAX_LENGTH,
    FOCAL_PERSON_NAME_MAX_LENGTH,
    FOCAL_PERSON_EMAIL_MAX_LENGTH,
    FOCAL_PERSON_PHONE_MAX_LENGTH,
    ORGANIZATION_ADDRESS_MAX_LENGTH,
} = require("../../utils/validConstantsUtil");

const hospitalTableQuery = `
    CREATE TABLE IF NOT EXISTS hospital (
        hospital_id SERIAL PRIMARY KEY,
        name VARCHAR(${HOSPITAL_NAME_MAX_LENGTH}) NOT NULL UNIQUE,
        focal_person_name VARCHAR(${FOCAL_PERSON_NAME_MAX_LENGTH}),
        focal_person_email VARCHAR(${FOCAL_PERSON_EMAIL_MAX_LENGTH}),
        focal_person_phone VARCHAR(${FOCAL_PERSON_PHONE_MAX_LENGTH}),
        address VARCHAR(${ORGANIZATION_ADDRESS_MAX_LENGTH}),
        hospitalization_daily_charge NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (hospitalization_daily_charge >= 0),
        wallet_address varchar(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE hospital ADD COLUMN IF NOT EXISTS focal_person_name VARCHAR(${FOCAL_PERSON_NAME_MAX_LENGTH});
    ALTER TABLE hospital ADD COLUMN IF NOT EXISTS focal_person_email VARCHAR(${FOCAL_PERSON_EMAIL_MAX_LENGTH});
    ALTER TABLE hospital ADD COLUMN IF NOT EXISTS focal_person_phone VARCHAR(${FOCAL_PERSON_PHONE_MAX_LENGTH});
    ALTER TABLE hospital ADD COLUMN IF NOT EXISTS address VARCHAR(${ORGANIZATION_ADDRESS_MAX_LENGTH});
    ALTER TABLE hospital ADD COLUMN IF NOT EXISTS hospitalization_daily_charge NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (hospitalization_daily_charge >= 0);

    CREATE INDEX IF NOT EXISTS idx_hospital_hospital_id ON hospital(hospital_id);
    CREATE INDEX IF NOT EXISTS idx_hospital_name ON hospital(name);

    DROP TRIGGER IF EXISTS trg_update_hospital_updated_at ON hospital;

    CREATE TRIGGER trg_update_hospital_updated_at
    BEFORE UPDATE ON hospital
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { hospitalTableQuery };