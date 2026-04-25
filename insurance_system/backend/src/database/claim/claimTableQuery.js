const { INSURANCE_NUMBER_MAX_LENGTH } = require('../../utils/validConstantsUtil');

const claimTableQuery = `
    CREATE TABLE IF NOT EXISTS claim (
        claim_id SERIAL PRIMARY KEY,
        claim_id_in_hospital_system INTEGER UNIQUE NOT NULL,
        insurance_number VARCHAR(${INSURANCE_NUMBER_MAX_LENGTH}) REFERENCES insurance(insurance_number) ON DELETE CASCADE,
        cnic VARCHAR(15) REFERENCES person(cnic) ON DELETE CASCADE,

        claim_amount NUMERIC(10, 9) CHECK (claim_amount >= 0),
        claim_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        icd_codes TEXT,
        cpt_codes TEXT,
        appointment_date TIMESTAMP,
        hospital_name VARCHAR(255),
        doctor_name VARCHAR(255),

        status VARCHAR(50) CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',

        transaction_hash VARCHAR(255),
        block_number VARCHAR(255),
        from_wallet VARCHAR(255),
        to_wallet VARCHAR(255),
        amount_paid NUMERIC(10, 9) CHECK (amount_paid >= 0),
        is_paid BOOLEAN DEFAULT FALSE,
        payment_date TIMESTAMP
    );
`;

module.exports = { claimTableQuery };