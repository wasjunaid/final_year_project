const {
    SYSTEM_CONFIG,
    VALID_SYSTEM_ADMIN_ROLES
} = require("../../validations/system/systemValidations");

const systemAdminTableQuery = `
    CREATE TABLE IF NOT EXISTS system_admin (
        system_admin_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE PRIMARY KEY,
        role VARCHAR(${SYSTEM_CONFIG.SYSTEM_ADMIN_ROLE_MAX_LENGTH}) CHECK (role IN (${VALID_SYSTEM_ADMIN_ROLES.map(role => `'${role}'`).join(', ')})) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_system_admin_system_admin_id ON system_admin(system_admin_id);
    CREATE INDEX IF NOT EXISTS idx_system_admin_role ON system_admin(role);
`;

module.exports = { systemAdminTableQuery };