const insuranceTableQuery = `
    CREATE TABLE IF NOT EXISTS insurance (
        insurance_number SERIAL PRIMARY KEY,
        insurance_company_id INTEGER REFERENCES insurance_company(insurance_company_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { insuranceTableQuery };