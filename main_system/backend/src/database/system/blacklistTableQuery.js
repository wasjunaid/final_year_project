const blacklistTableQuery = `
    CREATE TABLE IF NOT EXISTS blacklist (
        blacklist_id SERIAL PRIMARY KEY,
        person_id INTEGER UNIQUE NOT NULL,
        reason VARCHAR(255) DEFAULT 'blockchain_sync' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE INDEX IF NOT EXISTS idx_blacklist_person_id ON blacklist(person_id);
    CREATE INDEX IF NOT EXISTS idx_blacklist_created_at ON blacklist(created_at);

    DROP TRIGGER IF EXISTS trg_update_blacklist_updated_at ON blacklist;
    
    -- Note: blacklist table is created but not updated, only created/read/cleared operations
`;

module.exports = { blacklistTableQuery };
