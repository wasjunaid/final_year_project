const unverifiedDocumentTableQuery = `
    CREATE TABLE IF NOT EXISTS unverified_document (
        document_id UUID PRIMARY KEY,
        person_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        original_name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        document_type VARCHAR(100) CHECK (document_type IN ('personal', 'lab report')) DEFAULT 'personal' NOT NULL,
        detail TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { unverifiedDocumentTableQuery };