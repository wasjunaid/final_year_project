const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { hashPasswordUtil, comparePasswordUtil } = require("../../utils/passwordUtil");
const { EmailService } = require("../Email/EmailService");
const { AddressService } = require("../Address/AddressService");
const { ContactService } = require("../Contact/ContactService");
const { LogService } = require("../Log/LogService");

class PersonService {
    /**
     * Checks if a person exists by person_id.
     * @param {number} person_id - The ID of the person.
     * @returns {Promise<Object|boolean>} - The person object if exists, otherwise false.
     * @throws {AppError} - If any issue occurs.
     */
    static async getPersonIfExists(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT *
                FROM
                person_view
                WHERE
                person_id = $1`,
                values: [person_id]
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
     * Checks if a person exists by email.
     * @param {string} email - The email of the person.
     * @returns {Promise<Object|boolean>} - The person object if exists, otherwise false.
     * @throws {AppError} - If any issue occurs.
     */
    static async getPersonByEmailIfExists(email) {
        try {
            if (!email) {
                throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT *
                FROM
                person_view
                WHERE
                email = $1`,
                values: [email]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PersonService.getPersonByEmailIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new person into the database if not exists.
     * @param {string} email - The email of the person.
     * @param {string} password - The password of the person.
     * @param {Object} optionalFields - Additional fields for the person.
     * @returns {Promise<Object>} - The inserted or updated person object.
     * @throws {AppError} - If any issue occurs.
     */
    static async insertPersonIfNotExists(email, password, optionalFields = {}) {
        try {
            const {
                first_name = null,
                last_name = null,
                is_verified = true // revert to false this is for testing purposes only
            } = optionalFields;

            let randomPassword = false;

            if (!email) {
                throw new AppError("Email is required", STATUS_CODES.BAD_REQUEST);
            }
            
            if (!password) {
                // password = Math.random().toString(36).slice(-12);
                randomPassword = true;
                password = "Test@123"; // revert this is for testing purposes only
            }

            const hashedPassword = await hashPasswordUtil(password, { validateStrength: !randomPassword });

            const query = {
                text: `INSERT INTO person
                (email, password_hash, first_name, last_name, is_verified)
                VALUES
                ($1, $2, $3, $4, $5)
                ON CONFLICT (email)
                DO
                UPDATE
                SET
                email = EXCLUDED.email
                RETURNING *, 
                (CASE WHEN xmax = 0 THEN false ELSE true END) AS email_existed`,
                values: [email, hashedPassword, first_name, last_name, is_verified]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(`Error inserting person`, STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            const person = result.rows[0];
            const emailExisted = person.email_existed;

            if (randomPassword && !emailExisted) {
                await EmailService.sendRandomPasswordEmail(email, password);
            }

            delete person.email_existed;

            delete person.password_hash;

            return person;
        } catch (error) {
            console.error(`Error in PersonService.insertPersonIfNotExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Updates a person's details.
     * @param {number} person_id - The ID of the person to update.
     * @param {Object} updates - The updates to apply.
     * @returns {Promise<Object>} - The updated person object.
     * @throws {AppError} - If any issue occurs.
     */
    static async updatePerson(person_id, updates = {}) {
        try {
            if (!person_id) {
                throw new AppError('person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (Object.keys(updates).length === 0) {
                throw new AppError('No updates provided', STATUS_CODES.BAD_REQUEST);
            }

            const person = await this.getPersonIfExists(person_id);
            if (!person) {
                throw new AppError('Person not found', STATUS_CODES.NOT_FOUND);
            }
            if (person.is_person_profile_complete) {
                if (updates.cnic) {
                    delete updates.cnic; // Prevent CNIC updates
                }
            }

            if (updates.address)
            {
                const addressRecord = await AddressService.insertAddressIfNotExists(updates.address);
                updates.address_id = addressRecord.address_id;
                delete updates.address;
            }

            if (updates.country_code && updates.number)
            {
                const contactRecord = await ContactService.insertContactIfNotExists(updates.country_code, updates.number);
                updates.contact_id = contactRecord.contact_id;
                delete updates.country_code;
                delete updates.number;
            }

            const fields = [];
            const values = [];
            let index = 1;

            for (const [key, value] of Object.entries(updates)) {
                fields.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }

            const query = {
                text: `UPDATE person
                SET ${fields.join(', ')}
                WHERE
                person_id = $${index}
                RETURNING *`,
                values: [...values, person_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(`Error updating person`, STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            await LogService.insertLog(person_id, `Updated person: ${JSON.stringify(updates)}`);

            if (!person.is_person_profile_complete) {
                const isCompleted = await this.completeProfileIfComplete(person_id);
                if (isCompleted) {
                    delete isCompleted.password_hash;

                    return isCompleted;
                }
            }

            delete result.rows[0].password_hash;

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PersonService.updatePerson: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Updates the password hash of a person.
     * @param {number} person_id - The ID of the person to update.
     * @param {string} password - The new password.
     * @returns {Promise<boolean>} - True if the update was successful.
     * @throws {AppError} - If any issue occurs.
     */
    static async updatePersonPasswordHash(person_id, password) {
        try {
            if (!person_id) {
                throw new AppError('person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!password) {
                throw new AppError('password is required', STATUS_CODES.BAD_REQUEST);
            }

            if (typeof password !== 'string') {
                throw new AppError('password must be a string', STATUS_CODES.BAD_REQUEST);
            }

            const password_hash = await hashPasswordUtil(password);

            const query = {
                text: `UPDATE person
                SET
                password_hash = $1
                WHERE
                person_id = $2
                RETURNING *`,
                values: [password_hash, person_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(`Error updating person`, STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in PersonService.updatePersonPasswordHash: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Updates the is_verified status of a person.
     * @param {number} person_id - The ID of the person to update.
     * @returns {Promise<boolean>} - True if the update was successful.
     * @throws {AppError} - If any issue occurs.
     */
    static async updatePersonIsVerified(person_id) {
        try {
            if (!person_id) {
                throw new AppError('person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `UPDATE person
                SET
                is_verified = TRUE
                WHERE
                person_id = $1
                RETURNING *`,
                values: [person_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(`Error updating verification status`, STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in PersonService.updatePersonIsVerified: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Soft deletes a person by setting is_deleted to TRUE.
     * @param {number} person_id - The ID of the person to delete.
     * @returns {Promise<boolean>} - True if deletion was successful.
     * @throws {AppError} - If any issue occurs.
     */
    static async deletePerson(person_id) {
        try {
            if (!person_id) {
                throw new AppError('person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `UPDATE person
                SET
                is_deleted = TRUE
                WHERE
                person_id = $1
                RETURNING *`,
                values: [person_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(`Error deleting person`, STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in PersonService.deletePerson: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Compares the email and password with the database records.
     * @param {string} email - The email of the person.
     * @param {string} password - The password of the person.
     * @returns {Promise<number>} - The person_id if the email and password match.
     * @throws {AppError} - If the email or password is invalid.
     */
    static async compareEmailAndPassword(email, password) {
        try {
            if (!email) {
                throw new AppError('email is required', STATUS_CODES.BAD_REQUEST);
            }

            if (typeof email !== 'string') {
                throw new AppError('email must be a string', STATUS_CODES.BAD_REQUEST);
            }

            if (!password) {
                throw new AppError('password is required', STATUS_CODES.BAD_REQUEST);
            }

            if (typeof password !== 'string') {
                throw new AppError('password must be a string', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT person_id,
                password_hash,
                is_verified,
                is_deleted
                FROM person
                WHERE
                email = $1`,
                values: [email]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Invalid Credentials', STATUS_CODES.UNAUTHORIZED);
            }

            const person = result.rows[0];

            const isPasswordValid = await comparePasswordUtil(password, person.password_hash);
            if (!isPasswordValid) {
                throw new AppError("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
            }

            return person;
        } catch (error) {
            console.error(`Error in PersonService.compareEmailAndPassword: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Marks person profile as complete if all fields are filled.
     * @param {number} person_id - The ID of the person to check and update.
     * @returns {Promise<Object>} - The updated person object with profile marked as complete.
     * @throws {AppError} if any issue occurs
     */
    static async completeProfileIfComplete(person_id) {
        try {
            if (!person_id) {
                throw new AppError('person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const person = await this.getPersonIfExists(person_id);
            if (!person) {
                throw new AppError('Person does not exist', STATUS_CODES.NOT_FOUND);
            }

            for (const [key, value] of Object.entries(person)) {
                if (value === null) {
                    return false;
                }
            }

            const query = {
                text: `UPDATE person
                SET is_profile_complete = TRUE
                WHERE person_id = $1
                RETURNING *`,
                values: [person_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Error completing profile', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PersonService.completeProfileIfComplete: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PersonService };