const insuranceCompanyTableQuery = `
    CREATE TABLE IF NOT EXISTS insurance_company (
        insurance_company_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { insuranceCompanyTableQuery };
