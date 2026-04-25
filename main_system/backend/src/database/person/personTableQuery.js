const { EMAIL_CONFIG } = require("../../utils/emailUtil");
const { NAME_MAX_LENGTH, CNIC_MAX_LENGTH, GENDER_MAX_LENGTH, VALID_GENDERS } = require("../../utils/validConstantsUtil");

const personTableQuery = `
    CREATE TABLE IF NOT EXISTS person (
        person_id SERIAL PRIMARY KEY,
        email VARCHAR(${EMAIL_CONFIG.MAX_LENGTH}) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name VARCHAR(${NAME_MAX_LENGTH}),
        last_name VARCHAR(${NAME_MAX_LENGTH}),
        cnic VARCHAR(${CNIC_MAX_LENGTH}) UNIQUE,
        date_of_birth DATE CHECK (date_of_birth <= CURRENT_DATE),
        gender VARCHAR(${GENDER_MAX_LENGTH}) CHECK (gender IN (${VALID_GENDERS.map(gender => `'${gender}'`).join(', ')})),
        address_id INTEGER REFERENCES address(address_id) DEFAULT NULL,
        contact_id INTEGER REFERENCES contact(contact_id) DEFAULT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        is_profile_complete BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DROP VIEW IF EXISTS person_view;

    CREATE VIEW person_view AS
    SELECT 
        p.person_id,
        p.email,
        p.first_name,
        p.last_name,
        p.cnic,
        TO_CHAR(p.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
        p.gender,
        p.address_id,
        a.address,
        p.contact_id,
        c.country_code,
        c.number,
        p.is_verified,
        p.is_profile_complete AS is_person_profile_complete,
        p.is_deleted
    FROM person p
    LEFT JOIN address a ON p.address_id = a.address_id
    LEFT JOIN contact c ON p.contact_id = c.contact_id;

    CREATE INDEX IF NOT EXISTS idx_person_person_id ON person(person_id);
    CREATE INDEX IF NOT EXISTS idx_person_email ON person(email);
    CREATE INDEX IF NOT EXISTS idx_person_cnic ON person(cnic);
    CREATE INDEX IF NOT EXISTS idx_person_address_id ON person(address_id);
    CREATE INDEX IF NOT EXISTS idx_person_contact_id ON person(contact_id);
    CREATE INDEX IF NOT EXISTS idx_person_is_deleted ON person(is_deleted);

    DROP TRIGGER IF EXISTS trg_update_person_updated_at ON person;

    CREATE TRIGGER trg_update_person_updated_at
    BEFORE UPDATE ON person
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { personTableQuery };