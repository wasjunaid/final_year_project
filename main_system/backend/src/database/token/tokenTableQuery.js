const {
    TOKEN_CONFIG,
    VALID_TOKEN_TYPES
} = require("../../utils/tokenUtil");

const tokenTableQuery = `
    CREATE TABLE IF NOT EXISTS token (
        person_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        token_type VARCHAR(${TOKEN_CONFIG.TOKEN_TYPE_MAX_LENGTH}) CHECK (token_type IN (${VALID_TOKEN_TYPES.map(token_type => `'${token_type}'`).join(', ')})) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (person_id, token_type)
    );

    CREATE INDEX IF NOT EXISTS idx_token_person_id ON token(person_id);
    CREATE INDEX IF NOT EXISTS idx_token_token ON token(token);
    CREATE INDEX IF NOT EXISTS idx_token_expires_at ON token(expires_at);
    CREATE INDEX IF NOT EXISTS idx_token_token_type ON token(token_type);
`;

module.exports = { tokenTableQuery };