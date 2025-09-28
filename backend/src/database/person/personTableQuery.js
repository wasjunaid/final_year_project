const personTableQuery = `
    CREATE TABLE IF NOT EXISTS person (
        person_id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        cnic VARCHAR(15) UNIQUE,
        date_of_birth DATE,
        gender VARCHAR(1),
        blood_group VARCHAR(3),
        address_id INTEGER REFERENCES address(address_id) ON DELETE SET NULL DEFAULT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = { personTableQuery };