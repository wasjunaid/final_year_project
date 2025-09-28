const { pool } = require("../../config/databaseConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class ContactService {
    static async getContact(contact_id) {
        if (!contact_id) {
            throw new AppError("contact_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM contact
                WHERE
                contact_id = $1`,
                values: [contact_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Contact not found", statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error getting contact: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async insertContact(country_code, number) {
        if (!country_code) {
            throw new AppError("country_code is required", statusCodes.BAD_REQUEST);
        }
        if (!number) {
            throw new AppError("number is required", statusCodes.BAD_REQUEST);
        }

        try {
            const contactExists = await this.checkContactExists(country_code, number);
            if (contactExists) {
                throw new AppError("Contact already exists", statusCodes.CONFLICT);
            }

            const query = {
                text: `INSERT INTO contact
                (country_code, number)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [country_code, number]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error inserting contact", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error inserting contact: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async updateContact(country_code, number) {
        if (!country_code) {
            throw new AppError("country_code is required", statusCodes.BAD_REQUEST);
        }
        if (!number) {
            throw new AppError("number is required", statusCodes.BAD_REQUEST);
        }

        try {
            const contactExists = await this.checkContactExists(country_code, number);
            if (!contactExists) {
                const insertedContact = await this.insertContact(country_code, number);

                return insertedContact;
            }
            
            const fetchedContact = await this.getContact(contactExists);

            return fetchedContact;
        } catch (error) {
            throw new AppError(`Error updating contact: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async deleteContact(contact_id) {
        if (!contact_id) {
            throw new AppError("contact_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM contact
                WHERE
                contact_id = $1
                RETURNING *`,
                values: [contact_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error deleting contact", statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            throw new AppError(`Error deleting contact: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async checkContactExists(country_code, number) {
        if (!country_code) {
            throw new AppError("country_code is required", statusCodes.BAD_REQUEST);
        }
        if (!number) {
            throw new AppError("number is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT contact_id FROM contact
                WHERE
                country_code = $1 AND number = $2`,
                values: [country_code, number]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0].contact_id;
        } catch (error) {
            throw new AppError(`Error checking contact existence: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { ContactService };