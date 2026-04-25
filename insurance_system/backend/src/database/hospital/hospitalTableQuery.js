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
        wallet_address VARCHAR(255)
    );

    ALTER TABLE hospital ADD COLUMN IF NOT EXISTS focal_person_name VARCHAR(${FOCAL_PERSON_NAME_MAX_LENGTH});
    ALTER TABLE hospital ADD COLUMN IF NOT EXISTS focal_person_email VARCHAR(${FOCAL_PERSON_EMAIL_MAX_LENGTH});
    ALTER TABLE hospital ADD COLUMN IF NOT EXISTS focal_person_phone VARCHAR(${FOCAL_PERSON_PHONE_MAX_LENGTH});
    ALTER TABLE hospital ADD COLUMN IF NOT EXISTS address VARCHAR(${ORGANIZATION_ADDRESS_MAX_LENGTH});
    ALTER TABLE hospital ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255);
`;

module.exports = { hospitalTableQuery };