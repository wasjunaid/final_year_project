const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");
const { validateFieldsForInsertContactIfNotExists } = require("../../validations/contact/contactValidations");

class ContactService {
    /**
     * Inserts a new contact into the database if not exists.
     * @param {string} country_code - The country code of the contact.
     * @param {string} number - The phone number of the contact.
     * @returns {Promise<object>} The inserted contact object or existing one if already present.
     * @throws {AppError} if any issue occurs
     */
    static async insertContactIfNotExists(country_code, number) {
        try {
            if (!country_code) {
                throw new AppError("country_code is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!number) {
                throw new AppError("number is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ country_code, number } = validateFieldsForInsertContactIfNotExists({ country_code, number }));

            const query = {
                text: `INSERT INTO contact
                (country_code, number)
                VALUES
                ($1, $2)
                ON CONFLICT (country_code, number)
                DO
                UPDATE
                SET
                country_code = EXCLUDED.country_code
                RETURNING *`,
                values: [country_code, number]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error inserting contact", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in ContactService.insertContactIfNotExists: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Contact already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }
}

module.exports = { ContactService };