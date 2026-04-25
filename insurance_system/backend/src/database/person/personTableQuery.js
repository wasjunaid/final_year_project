const { CNIC_MAX_LENGTH, NAME_MAX_LENGTH } = require("../../utils/validConstantsUtil");

const personTableQuery = `
    CREATE TABLE IF NOT EXISTS person (
        cnic VARCHAR(${CNIC_MAX_LENGTH}) PRIMARY KEY,
        first_name VARCHAR(${NAME_MAX_LENGTH}) NOT NULL,
        last_name VARCHAR(${NAME_MAX_LENGTH}) NOT NULL
    );
`;

module.exports = { personTableQuery };