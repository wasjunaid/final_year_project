const { pool } = require("../../config/databaseConfig");
const { ContactService } = require("../Contact/ContactService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class PersonContactService {
    static async getPersonContacts(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT pc.*,
                c.country_code,
                c.number
                FROM person_contact pc
                JOIN contact c ON pc.contact_id = c.contact_id
                WHERE
                pc.person_id = $1`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`No contacts found for person_id: ${person_id}`, statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting person contacts: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertPersonContact(person_id, country_code, number, is_primary = true) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!country_code) {
            throw new AppError("country_code is required", statusCodes.BAD_REQUEST);
        }
        if (!number) {
            throw new AppError("number is required", statusCodes.BAD_REQUEST);
        }

        try {
            const contact = await ContactService.updateContact(country_code, number);

            const query = {
                text: `INSERT INTO person_contact
                (person_id, contact_id, is_primary)
                VALUES
                ($1, $2, $3)
                RETURNING *`,
                values: [person_id, contact.contact_id, is_primary]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Failed to insert person contact`, statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting person contact: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updatePersonContact(person_contact_id, {
        country_code,
        number,
        is_primary = true
    }) {
        if (!person_contact_id) {
            throw new AppError('person_contact_id is required', statusCodes.BAD_REQUEST);
        }
        if (!country_code && !number) {
            throw new AppError('No updates provided', statusCodes.BAD_REQUEST);
        }

        try {
            const contact = await ContactService.updateContact(country_code, number);

            const query = {
                text: `UPDATE person_contact
                SET contact_id = $1,
                is_primary = $2,
                updated_at = CURRENT_TIMESTAMP
                WHERE person_contact_id = $3
                RETURNING *`,
                values: [contact.contact_id, is_primary, person_contact_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error updating person_contact`, statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating person contact: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deletePersonContact(person_contact_id) {
        if (!person_contact_id) {
            throw new AppError("person_contact_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM person_contact
                WHERE
                person_contact_id = $1`,
                values: [person_contact_id]
            };
            const result = await pool.query(query);
            if (result.rowCount === 0) {
                throw new AppError(`Failed to delete person contact with id: ${person_contact_id}`, statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            console.error(`Error deleting person contact: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PersonContactService };