const { pool } = require("../../config/databaseConfig");
const { hashPasswordUtil } = require("../../utils/hashPasswordUtil");
const { verifyPasswordUtil } = require("../../utils/verifyPasswordUtil");
const { TokenService } = require("../Token/TokenService");
const { EmailService } = require("../Email/EmailService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class PersonService {
    static async getPerson(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT person_id,
                email,
                first_name,
                last_name,
                cnic,
                gender,
                TO_CHAR(date_of_birth, 'YYYY-MM-DD') as date_of_birth,
                blood_group,
                is_verified
                FROM person
                WHERE person_id = $1`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Person with person_id ${person_id} not found`, statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error getting person: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getPersonByEmail(email) {
        if (!email) {
            throw new AppError("email is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT person_id,
                email,
                first_name,
                last_name,
                cnic,
                gender,
                TO_CHAR(date_of_birth, 'YYYY-MM-DD') as date_of_birth,
                blood_group,
                is_verified
                FROM person
                WHERE
                email = $1`,
                values: [email]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Person with email ${email} not found`, statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error getting person by email: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getPersons() {
        try {
            const query = {
                text: `SELECT person_id,
                email,
                first_name,
                last_name,
                cnic,
                gender,
                TO_CHAR(date_of_birth, 'YYYY-MM-DD') as date_of_birth,
                blood_group,
                is_verified
                FROM person
                ORDER BY created_at DESC`
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`No persons found`, statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting persons: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertPerson(email, password) {
        if (!email) {
            throw new AppError("Email is required", statusCodes.BAD_REQUEST);
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError("Invalid email format", statusCodes.BAD_REQUEST);
        }
        if (!password) {
            throw new AppError("Password is required", statusCodes.BAD_REQUEST);
        }

        try {
            const emailInUse = await this.checkEmailInUse(email);
            if(emailInUse) {
                throw new AppError(`Email already in use`, statusCodes.CONFLICT);
            }

            const hashedPassword = await hashPasswordUtil(password);

            const query = {
                text: `INSERT INTO person
                (email, password_hash)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [email, hashedPassword]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error inserting person`, statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting person: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertPersonIfNotExists(email, password, is_verified = false) {
        let randomPass = false;
        if (!email) {
            throw new AppError("Email is required", statusCodes.BAD_REQUEST);
        }
        if (!password) {
            password = Math.random().toString(36).slice(-12);
            randomPass = true;
        }

        try {
            let person;
            const emailExists = await this.checkEmailInUse(email);
            if (!emailExists) {
                person = await this.insertPerson(email, password);
            } else {
                person = await this.getPersonByEmail(email);
            }

            if (randomPass) {
                await EmailService.sendRandomPasswordEmail(email, password);
            }

            if (is_verified && !person.is_verified) {
                person = await this.updatePersonIsVerifiedWithoutToken(person.person_id);
            }

            return person;
        } catch (error) {
            console.error(`Error inserting person: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertPersonForGoogleAuth(email, first_name, last_name, password) {
        if (!email) {
            throw new AppError("Email is required", statusCodes.BAD_REQUEST);
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError("Invalid email format", statusCodes.BAD_REQUEST);
        }
        if (!first_name) {
            throw new AppError("First name is required", statusCodes.BAD_REQUEST);
        }
        if (!last_name) {
            throw new AppError("Last name is required", statusCodes.BAD_REQUEST);
        }
        if (!password) {
            password = Math.random().toString(36).slice(-12);
        }

        try {
            let person;
            const emailInUse = await this.checkEmailInUse(email);
            if(emailInUse) {
                person = await this.getPersonByEmail(email);
                
                return person;
            }

            const hashedPassword = await hashPasswordUtil(password);

            const query = {
                text: `INSERT INTO person
                (email, password_hash, first_name, last_name, is_verified)
                VALUES
                ($1, $2, $3, $4, $5)
                RETURNING *`,
                values: [email, hashedPassword, first_name, last_name, true]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error inserting person`, statusCodes.INTERNAL_SERVER_ERROR);
            }

            await EmailService.sendRandomPasswordEmail(email, password);

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting person for google auth: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updatePerson(person_id, updates) {
        if (!person_id) {
            throw new AppError('person_id is required', statusCodes.BAD_REQUEST);
        }
        if (Object.keys(updates).length === 0) {
            throw new AppError('No updates provided', statusCodes.BAD_REQUEST);
        }

        try {
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
                SET ${fields.join(', ')},
                updated_at = CURRENT_TIMESTAMP
                WHERE
                person_id = $${index}
                RETURNING *`,
                values: [...values, person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error updating person`, statusCodes.INTERNAL_SERVER_ERROR);
            }

            await LogService.insertLog(person_id, `Updated person: ${JSON.stringify(updates)}`);

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating person: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updatePersonPasswordHash(token, password) {
        if (!token) {
            throw new AppError('token is required', statusCodes.BAD_REQUEST);
        }
        if (!password) {
            throw new AppError('password is required', statusCodes.BAD_REQUEST);
        }

        try {
            const tokenResult = await TokenService.getValidToken(token, 'password_reset_token');

            const password_hash = await hashPasswordUtil(password);

            const query = {
                text: `UPDATE person
                SET
                password_hash = $1,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                person_id = $2
                RETURNING *`,
                values: [password_hash, tokenResult.person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error updating person`, statusCodes.INTERNAL_SERVER_ERROR);
            }

            await TokenService.deleteToken(tokenResult.person_id, 'password_reset_token');

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating person password hash: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updatePersonIsVerified(token) {
        if (!token) {
            throw new AppError('token is required', statusCodes.BAD_REQUEST);
        }

        try {
            const tokenResult = await TokenService.getValidToken(token, 'email_verification_token');

            const query = {
                text: `UPDATE person
                SET
                is_verified = TRUE,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                person_id = $1
                RETURNING *`,
                values: [tokenResult.person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error updating verification status`, statusCodes.INTERNAL_SERVER_ERROR);
            }

            await TokenService.deleteToken(tokenResult.person_id, 'email_verification_token');

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating person is verified: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deletePerson(person_id) {
        if (!person_id) {
            throw new AppError('person_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM person
                WHERE
                person_id = $1
                RETURNING *`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error deleting person`, statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            console.error(`Error deleting person: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkEmailInUse(email) {
        if (!email) {
            throw new AppError('email is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM person
                WHERE
                email = $1`,
                values: [email]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Error checking email in use: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async verifyEmailAndPassword(email, password) {
        if (!email) {
            throw new AppError('email is required', statusCodes.BAD_REQUEST);
        }
        if (!password) {
            throw new AppError('password is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT person_id,
                password_hash
                FROM person
                WHERE
                email = $1`,
                values: [email]
            }
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('Invalid Credentials', statusCodes.UNAUTHORIZED);
            }

            const isPasswordValid = await verifyPasswordUtil(password, result.rows[0].password_hash);
            if (!isPasswordValid) {
                throw new AppError("Invalid Credentials", statusCodes.UNAUTHORIZED);
            }

            return result.rows[0].person_id;
        } catch (error) {
            console.error(`Error verifying email and password: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updatePersonIsVerifiedWithoutToken(person_id) {
        if (!person_id) {
            throw new AppError('person_id is required', statusCodes.BAD_REQUEST);
        }

        try {
                const query = {
                text: `UPDATE person
                SET
                is_verified = TRUE,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                person_id = $1
                RETURNING *`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error updating verification status`, statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating person is verified: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PersonService };