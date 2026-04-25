const {
    COUNTRY_CODE_CONFIG,
    NUMBER_CONFIG
} = require('../../validations/contact/contactValidations');

const contactTableQuery = `
    CREATE TABLE IF NOT EXISTS contact (
        contact_id SERIAL PRIMARY KEY,
        country_code VARCHAR(${COUNTRY_CODE_CONFIG.COUNTRY_CODE_MAX_LENGTH}) DEFAULT ${COUNTRY_CODE_CONFIG.DEFAULT_COUNTRY_CODE} NOT NULL CHECK (LENGTH(country_code) >= ${COUNTRY_CODE_CONFIG.COUNTRY_CODE_MIN_LENGTH} AND LENGTH(country_code) <= ${COUNTRY_CODE_CONFIG.COUNTRY_CODE_MAX_LENGTH}),
        number VARCHAR(${NUMBER_CONFIG.NUMBER_MAX_LENGTH}) NOT NULL CHECK (LENGTH(number) >= ${NUMBER_CONFIG.NUMBER_MIN_LENGTH} AND LENGTH(number) <= ${NUMBER_CONFIG.NUMBER_MAX_LENGTH}),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(country_code, number)
    );

    CREATE INDEX IF NOT EXISTS idx_contact_contact_id ON contact(contact_id);
    CREATE INDEX IF NOT EXISTS idx_contact_country_code ON contact(country_code);
    CREATE INDEX IF NOT EXISTS idx_contact_number ON contact(number);
`;

module.exports = { contactTableQuery };