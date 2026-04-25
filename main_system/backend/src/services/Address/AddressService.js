const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");
const { validateFieldsForInsertAddressIfNotExists } = require("../../validations/address/addressValidations");

class AddressService {
    /**
     * Inserts a new address into the database if not exists.
     * @param {string} address - The address to insert.
     * @returns {Promise<object>} The inserted address object or existing one if already present.
     * @throws {AppError} if any issue occurs
     */
    static async insertAddressIfNotExists(address) {
        try {
            if (!address) {
                throw new AppError('Address is required', STATUS_CODES.BAD_REQUEST);
            }

            ({ address } = validateFieldsForInsertAddressIfNotExists(address));

            const query = {
                text: `INSERT INTO address
                (address)
                VALUES
                ($1)
                ON CONFLICT (address)
                DO
                UPDATE
                SET
                address = EXCLUDED.address
                RETURNING *`,
                values: [address]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Error inserting address', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in AddressService.insertAddress: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError('Address already exists', STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }
}

module.exports = { AddressService };