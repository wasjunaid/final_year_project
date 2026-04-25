const { LAB_TEST_NAME_MAX_LENGTH } = require("../../utils/validConstantsUtil");

const labTestTableQuery = `
    CREATE TABLE IF NOT EXISTS lab_test (
        lab_test_id SERIAL PRIMARY KEY,
        hospital_id INTEGER REFERENCES hospital(hospital_id) ON DELETE CASCADE,
        name VARCHAR(${LAB_TEST_NAME_MAX_LENGTH}) NOT NULL,
        description TEXT NOT NULL,
        cost NUMERIC(10, 9) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(hospital_id, name)
    );

    CREATE INDEX IF NOT EXISTS idx_lab_test_hospital_id ON lab_test(hospital_id);
    CREATE INDEX IF NOT EXISTS idx_lab_test_name ON lab_test(name);

    DROP TRIGGER IF EXISTS trg_update_lab_test_updated_at ON lab_test;

    CREATE TRIGGER trg_update_lab_test_updated_at
    BEFORE UPDATE ON lab_test
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { labTestTableQuery };