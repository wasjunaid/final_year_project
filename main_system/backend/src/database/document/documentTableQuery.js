const { DOCUMENT_ORIGINAL_NAME_MAX_LENGTH, DOCUMENT_FILE_NAME_MAX_LENGTH, DOCUMENT_MIME_TYPE_MAX_LENGTH, UNVERIFIED_DOCUMENT_TYPE_MAX_LENGTH, VALID_UNVERIFIED_DOCUMENT_TYPES } = require("../../utils/validConstantsUtil");

const documentTableQuery = `
    CREATE TABLE IF NOT EXISTS document (
        document_id UUID PRIMARY KEY,
        patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
        original_name VARCHAR(${DOCUMENT_ORIGINAL_NAME_MAX_LENGTH}),
        file_name VARCHAR(${DOCUMENT_FILE_NAME_MAX_LENGTH}),
        mime_type VARCHAR(${DOCUMENT_MIME_TYPE_MAX_LENGTH}),
        file_size BIGINT,
        ipfs_hash TEXT,
        document_type VARCHAR(${UNVERIFIED_DOCUMENT_TYPE_MAX_LENGTH}) CHECK (document_type IN (${VALID_UNVERIFIED_DOCUMENT_TYPES.map(type => `'${type}'`).join(', ')})) DEFAULT NULL,

        uploaded_by INTEGER REFERENCES person(person_id) DEFAULT NULL,
        appointment_id INTEGER REFERENCES appointment(appointment_id) DEFAULT NULL,
        lab_test_id INTEGER REFERENCES lab_test(lab_test_id) DEFAULT NULL,
        lab_test_cost NUMERIC(10, 9) DEFAULT NULL,

        is_verified BOOLEAN DEFAULT FALSE,
        detail TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DROP VIEW IF EXISTS unverified_document_view;

    CREATE VIEW unverified_document_view AS
    SELECT 
        d.document_id,
        d.patient_id,
        d.original_name,
        d.mime_type,
        d.file_size,
        d.ipfs_hash,
        TO_CHAR(d.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        d.document_type,
        d.is_verified,
        d.detail,
        d.appointment_id,
        d.lab_test_id,
        lt.name as lab_test_name,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        h.hospital_id AS hospital_id_of_appointment
    FROM document d
    LEFT JOIN appointment a ON d.appointment_id = a.appointment_id
    LEFT JOIN person p ON a.patient_id = p.person_id
    LEFT JOIN hospital h ON a.hospital_id = h.hospital_id
    LEFT JOIN lab_test lt ON d.lab_test_id = lt.lab_test_id
    WHERE d.is_verified = FALSE;

    DROP VIEW IF EXISTS verified_document_view;

    CREATE VIEW verified_document_view AS
    SELECT 
        d.document_id,
        d.patient_id,
        d.original_name,
        d.mime_type,
        d.file_size,
        d.ipfs_hash,
        TO_CHAR(d.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        d.uploaded_by,
        p.first_name AS uploaded_by_first_name,
        p.last_name AS uploaded_by_last_name,
        d.appointment_id,
        a.hospital_id,
        h.name AS hospital_name,
        d.lab_test_id,
        lt.name as lab_test_name,
        lt.description as lab_test_description,
        d.lab_test_cost,
        d.is_verified,
        d.detail
    FROM document d
    JOIN person p ON d.uploaded_by = p.person_id
    JOIN appointment a ON d.appointment_id = a.appointment_id
    JOIN hospital h ON a.hospital_id = h.hospital_id
    JOIN lab_test lt ON d.lab_test_id = lt.lab_test_id
    WHERE d.is_verified = TRUE;

    CREATE INDEX IF NOT EXISTS idx_document_patient_id ON document(patient_id);
    CREATE INDEX IF NOT EXISTS idx_document_appointment_id ON document(appointment_id);
    CREATE INDEX IF NOT EXISTS idx_document_lab_test_id ON document(lab_test_id);
    CREATE INDEX IF NOT EXISTS idx_document_is_verified ON document(is_verified);
    CREATE INDEX IF NOT EXISTS idx_document_ipfs_hash ON document(ipfs_hash);

    DROP TRIGGER IF EXISTS trg_update_document_updated_at ON document;

    CREATE TRIGGER trg_update_document_updated_at
    BEFORE UPDATE ON document
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { documentTableQuery };