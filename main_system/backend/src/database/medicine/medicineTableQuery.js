const { MEDICINE_CONFIG } = require('../../validations/medicine/medicineValidations');

const medicineTableQuery = `
    CREATE TABLE IF NOT EXISTS medicine (
        medicine_id SERIAL PRIMARY KEY,
        name VARCHAR(${MEDICINE_CONFIG.MEDICINE_NAME_MAX_LENGTH}) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { medicineTableQuery };