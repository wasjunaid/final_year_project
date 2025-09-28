const addressTableQuery = `
    CREATE TABLE IF NOT EXISTS address (
        address_id SERIAL PRIMARY KEY,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { addressTableQuery };