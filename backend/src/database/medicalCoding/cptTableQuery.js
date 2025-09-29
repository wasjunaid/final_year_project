const cptTableQuery = `
    CREATE TABLE IF NOT EXISTS cpt (
        cpt_code VARCHAR(10) PRIMARY KEY,
        description TEXT NOT NULL
    );
`;

module.exports = { cptTableQuery };