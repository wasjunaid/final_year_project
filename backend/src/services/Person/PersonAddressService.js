const { pool } = require("../../config/databaseConfig");
const { AddressService } = require("../Address/AddressService");
const { PersonService } = require("../Person/PersonService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class PersonAddressService {
    static async getPersonAddress(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT address FROM address a
                JOIN person p ON a.address_id = p.address_id
                WHERE p.person_id = $1`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`No address found for person_id: ${person_id}`, statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            throw new AppError(`Error getting person address: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async insertOrUpdatePersonAddress(person_id, address) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!address) {
            throw new AppError("address is required", statusCodes.BAD_REQUEST);
        }

        try {
            const address = await AddressService.updateAddress(address);

            const personAddress = await PersonService.updatePerson(person_id, { address_id: address.address_id });

            return personAddress.address_id;
        } catch (error) {
            throw new AppError(`Error inserting person address: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { PersonAddressService };