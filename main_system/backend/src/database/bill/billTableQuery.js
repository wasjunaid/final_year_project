const { CLAIM_STATUS_MAX_LENGTH, VALID_CLAIM_STATUSES_OBJECT, VALID_CLAIM_STATUSES } = require("../../utils/validConstantsUtil");

const billTableQuery = `
  CREATE TABLE IF NOT EXISTS bill (
    bill_id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointment(appointment_id) ON DELETE CASCADE UNIQUE NOT NULL,
    amount DECIMAL(10, 9) NOT NULL CHECK (amount >= 0),
    is_claim BOOLEAN DEFAULT FALSE,
    claim_status VARCHAR(${CLAIM_STATUS_MAX_LENGTH}) CHECK (claim_status IN (${VALID_CLAIM_STATUSES.map(status => `'${status}'`).join(", ")})) DEFAULT NULL,
    transaction_hash VARCHAR(255),
    block_number VARCHAR(255),
    from_wallet VARCHAR(255),
    to_wallet VARCHAR(255),
    applied_hospitalization_daily_charge NUMERIC(10, 2) DEFAULT 0 CHECK (applied_hospitalization_daily_charge >= 0),
    hospitalization_days INTEGER DEFAULT 0 CHECK (hospitalization_days >= 0),
    hospitalization_amount NUMERIC(10, 2) DEFAULT 0 CHECK (hospitalization_amount >= 0),
    amount_paid NUMERIC(10, 9) DEFAULT 0 CHECK (amount_paid >= 0),
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  ALTER TABLE bill ADD COLUMN IF NOT EXISTS applied_hospitalization_daily_charge NUMERIC(10, 2) DEFAULT 0 CHECK (applied_hospitalization_daily_charge >= 0);
  ALTER TABLE bill ADD COLUMN IF NOT EXISTS hospitalization_days INTEGER DEFAULT 0 CHECK (hospitalization_days >= 0);
  ALTER TABLE bill ADD COLUMN IF NOT EXISTS hospitalization_amount NUMERIC(10, 2) DEFAULT 0 CHECK (hospitalization_amount >= 0);

  DROP TRIGGER IF EXISTS trg_update_bill_updated_at ON bill;

    CREATE TRIGGER trg_update_bill_updated_at
    BEFORE UPDATE ON bill
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { billTableQuery };