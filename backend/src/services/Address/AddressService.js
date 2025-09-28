const { pool } = require("../../config/databaseConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class AddressService {
    static async getAddress(address_id) {
        if (!address_id) {
            throw new AppError('address_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM address
                WHERE
                address_id = $1`,
                values: [address_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('Address not found', statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error getting address: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async insertAddress(address) {
        if (!address) {
            throw new AppError('Address is required', statusCodes.BAD_REQUEST);
        }

        try {
            const addressExists = await this.checkAddressExists(address);
            if (addressExists) {
                throw new AppError('Address already exists', statusCodes.CONFLICT);
            }

            const query = {
                text: `INSERT INTO address
                (address)
                VALUES
                ($1)
                RETURNING *`,
                values: [address]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('Error inserting address', statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error inserting address: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async updateAddress(address) {
        if (!address) {
            throw new AppError('address is required', statusCodes.BAD_REQUEST);
        }

        try {
            const addressExists = await this.checkAddressExists(address);
            if (!addressExists) {
                const insertedAddress = await this.insertAddress(address);

                return insertedAddress;
            }

            const fetchedAddress = await this.getAddress(addressExists);

            return fetchedAddress;
        } catch (error) {
            throw new AppError(`Error updating address: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async deleteAddress(address_id) {
        if (!address_id) {
            throw new AppError('address_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM address
                WHERE
                address_id = $1
                RETURNING *`,
                values: [address_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error deleting address`, statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            throw new AppError(`Error deleting address: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async checkAddressExists(address) {
        if (!address) {
            throw new AppError('address is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT address_id FROM address
                WHERE
                address = $1`,
                values: [address]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0].address_id;
        } catch (error) {
            throw new AppError(`Error checking address existence: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { AddressService };