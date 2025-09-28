const contactTableQuery = `
    CREATE TABLE IF NOT EXISTS contact (
        contact_id SERIAL PRIMARY KEY,
        country_code VARCHAR(5) DEFAULT '+92',
        number VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { contactTableQuery };