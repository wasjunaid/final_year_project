const verifiedDocumentTableQuery = `
    CREATE TABLE IF NOT EXISTS verified_document (
        document_id UUID PRIMARY KEY,
        person_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        original_name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        uploaded_by INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        appointment_id INTEGER REFERENCES appointment(appointment_id) ON DELETE SET NULL,
        lab_test_id INTEGER REFERENCES lab_test(lab_test_id) ON DELETE SET NULL,
        detail TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { verifiedDocumentTableQuery };