const medicineTableQuery = `
    CREATE TABLE IF NOT EXISTS medicine (
        medicine_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { medicineTableQuery };