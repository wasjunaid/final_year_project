const insuranceCompanyTableQuery = `
    CREATE TABLE IF NOT EXISTS insurance_company (
        insurance_company_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    );
`;

module.exports = { insuranceCompanyTableQuery };