const validSystemAdminRoles = [
    'super admin',
    'admin'
]

const systemAdminTableQuery = `
    CREATE TABLE IF NOT EXISTS system_admin (
        system_admin_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE PRIMARY KEY,
        role VARCHAR(100) CHECK (role IN (${validSystemAdminRoles.map(role => `'${role}'`).join(', ')})) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { validSystemAdminRoles, systemAdminTableQuery };