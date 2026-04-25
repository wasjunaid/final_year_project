const superAdminTableQuery = `
    CREATE TABLE IF NOT EXISTS super_admin (
        super_admin_id INTEGER REFERENCES "user"(user_id) ON DELETE CASCADE PRIMARY KEY
    );
`;

module.exports = { superAdminTableQuery };