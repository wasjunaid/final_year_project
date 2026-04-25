const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { CNIC_REGEX, CNIC_HYPHENATED_REGEX } = require("../../utils/validConstantsUtil");

class PersonService {
    /**
     * Get a person by CNIC if they exist
     * @param {string} cnic - The CNIC of the person
     * @returns {Promise<Object|boolean>} - The person object or false if not found
     * @throws {AppError} - Throws error if database query fails
     */
    static async getPersonIfExists(cnic) {
        try {
            if (!cnic) {
                throw new AppError("CNIC is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM person WHERE cnic = $1`,
                values: [cnic],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PersonService.getPersonIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Get all persons if they exist
     * @returns {Promise<Array|boolean>} - Array of persons or false if none exist
     * @throws {AppError} - Throws error if database query fails
     */
    static async getPersonsIfExists() {
        try {
            const query = {
                text: `SELECT * FROM person`,
            };
            const result = await DatabaseService.query(query.text);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in PersonService.getPersonsIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Insert a person if they do not already exist
     * @param {Object} params - The person details
     * @param {string} params.cnic - The CNIC of the person
     * @param {string} params.first_name - The first name of the person
     * @param {string} params.last_name - The last name of the person
     * @returns {Promise<Object>} - The inserted or updated person object
     * @throws {AppError} - Throws error if validation fails or database query fails
     */
    static async insertPersonIfNotExists({ cnic, first_name, last_name }) {
        try {            
            if (!cnic) {
                throw new AppError("CNIC is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!CNIC_REGEX.test(cnic) && !CNIC_HYPHENATED_REGEX.test(cnic)) {
                throw new AppError("Invalid CNIC format", STATUS_CODES.BAD_REQUEST);
            }

            cnic = cnic.replace(/-/g, ''); // Remove hyphens if any

            if (!first_name) {
                throw new AppError("First name is required", STATUS_CODES.BAD_REQUEST);
            }

            first_name = first_name.trim().toLowerCase();

            if (first_name.length === 0) {
                throw new AppError("First name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!last_name) {
                throw new AppError("Last name is required", STATUS_CODES.BAD_REQUEST);
            }

            last_name = last_name.trim().toLowerCase();

            if (last_name.length === 0) {
                throw new AppError("Last name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO person
                (cnic, first_name, last_name)
                VALUES
                ($1, $2, $3)
                ON CONFLICT (cnic)
                DO
                UPDATE
                SET
                cnic = EXCLUDED.cnic
                RETURNING *`,
                values: [cnic, first_name, last_name]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert person", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PersonService.insertPersonIfNotExists: ${error.message} - ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PersonService };