const icdTableQuery = `
    CREATE TABLE IF NOT EXISTS icd (
        icd_code VARCHAR(10) PRIMARY KEY,
        description TEXT NOT NULL
    );
`;

module.exports = { icdTableQuery };