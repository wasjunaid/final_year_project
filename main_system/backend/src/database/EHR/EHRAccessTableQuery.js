const { EHR_ACCESS_STATUS_MAX_LENGTH, VALID_EHR_ACCESS_STATUSES_OBJECT, VALID_EHR_ACCESS_STATUSES } = require("../../utils/validConstantsUtil");

const EHRAccessTable = `
    CREATE TABLE IF NOT EXISTS ehr_access (
        ehr_access_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctor(doctor_id) ON DELETE CASCADE,
        status VARCHAR(${EHR_ACCESS_STATUS_MAX_LENGTH}) CHECK (status IN (${VALID_EHR_ACCESS_STATUSES.map(status => `'${status}'`).join(', ')})) DEFAULT '${VALID_EHR_ACCESS_STATUSES_OBJECT.REQUESTED}' NOT NULL,
        ipfs_cid VARCHAR(200),
        data_hash VARCHAR(66),
        blockchain_tx_hash VARCHAR(66),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (patient_id, doctor_id)
    );

    CREATE INDEX IF NOT EXISTS idx_ehr_access_patient_id ON ehr_access(patient_id);
    CREATE INDEX IF NOT EXISTS idx_ehr_access_doctor_id ON ehr_access(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_ehr_access_status ON ehr_access(status);
    CREATE INDEX IF NOT EXISTS idx_ehr_access_ipfs_cid ON ehr_access(ipfs_cid);
    CREATE INDEX IF NOT EXISTS idx_ehr_access_blockchain_tx ON ehr_access(blockchain_tx_hash);
    CREATE INDEX IF NOT EXISTS idx_ehr_access_data_hash ON ehr_access(data_hash);

    DROP TRIGGER IF EXISTS trg_update_ehr_access_updated_at ON ehr_access;

    CREATE TRIGGER trg_update_ehr_access_updated_at
    BEFORE UPDATE ON ehr_access
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { EHRAccessTable };