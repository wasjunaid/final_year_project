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
            console.error(`Error getting contact: ${error.message} ${error.status}`);
            throw error;
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
            console.error(`Error inserting contact: ${error.message} ${error.status}`);
            throw error;
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
            console.error(`Error updating contact: ${error.message} ${error.status}`);
            throw error;
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
            console.error(`Error deleting contact: ${error.message} ${error.status}`);
            throw error;
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
            console.error(`Error checking contact existence: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { ContactService };