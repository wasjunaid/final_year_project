const hospitalTableQuery = `
    CREATE TABLE IF NOT EXISTS hospital (
        hospital_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address_id INTEGER REFERENCES address(address_id) ON DELETE SET NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { hospitalTableQuery };