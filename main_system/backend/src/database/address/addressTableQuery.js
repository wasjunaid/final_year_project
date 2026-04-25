const addressTableQuery = `
    CREATE TABLE IF NOT EXISTS address (
        address_id SERIAL PRIMARY KEY,
        address TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_address_address_id ON address(address_id);
    CREATE INDEX IF NOT EXISTS idx_address_address ON address(address);
`;

module.exports = { addressTableQuery };