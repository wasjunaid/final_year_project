const modifierTableQuery = `
    CREATE TABLE IF NOT EXISTS modifier (
        modifier_code VARCHAR(10) PRIMARY KEY,
        description TEXT NOT NULL
    );
`;

module.exports = { modifierTableQuery };