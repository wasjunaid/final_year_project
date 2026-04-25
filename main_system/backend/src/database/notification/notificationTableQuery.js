const { AUTH_CONFIG } = require("../../validations/auth/authValidations");
const {
    NOTIFICATION_CONFIG,
    VALID_NOTIFICATION_TYPES
} = require("../../validations/notification/notificationValidations")

// ADD CHECK TO RELATED TABLE TO BE IN VALID_TABLES IF NEEDED

const notificationTableQuery = `
    CREATE TABLE IF NOT EXISTS notification (
        notification_id SERIAL PRIMARY KEY,
        person_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE,
        role VARCHAR(${AUTH_CONFIG.ROLE_MAX_LENGTH}) NOT NULL,
        title VARCHAR(${NOTIFICATION_CONFIG.NOTIFICATION_TITLE_MAX_LENGTH}) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(${NOTIFICATION_CONFIG.NOTIFICATION_TYPE_MAX_LENGTH}) CHECK (type IN (${VALID_NOTIFICATION_TYPES.map(type => `'${type}'`).join(', ')})) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_id INTEGER,
        related_table VARCHAR(${NOTIFICATION_CONFIG.NOTIFICATION_RELATED_TABLE_MAX_LENGTH}),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DROP VIEW IF EXISTS notification_view;

    CREATE VIEW notification_view AS
    SELECT 
        n.notification_id,
        n.person_id,
        n.role,
        n.title,
        n.message,
        n.type,
        n.is_read,
        n.related_id,
        n.related_table,
        TO_CHAR(n.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        TO_CHAR(n.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
    FROM notification n;

    CREATE INDEX IF NOT EXISTS idx_notification_notification_id ON notification(notification_id);
    CREATE INDEX IF NOT EXISTS idx_notification_person_id ON notification(person_id);
    CREATE INDEX IF NOT EXISTS idx_notification_role ON notification(role);

    DROP TRIGGER IF EXISTS trg_update_notification_updated_at ON notification;

    CREATE TRIGGER trg_update_notification_updated_at
    BEFORE UPDATE ON notification
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { notificationTableQuery };