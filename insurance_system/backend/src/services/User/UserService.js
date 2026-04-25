const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { hashPasswordUtil, comparePasswordUtil } = require("../../utils/passwordUtil");
const { validateEmail } = require("../../utils/emailUtil");

class UserService {
    /**
     * gets user by user_id if exists
     * @param {number} user_id - user id
     * @returns {Promise<Object|boolean>} user object if exists, false otherwise
     * @throws {AppError} if any issue occurs
     */
    static async getUserIfExists(user_id) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM user_view
                WHERE
                user_id = $1`,
                values: [user_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in UserService.getUserIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * gets user by email if exists
     * @param {string} email - user email
     * @returns {Promise<Object|boolean>} user object if exists, false otherwise
     * @throws {AppError} if any issue occurs
     */
    static async getUserByEmailIfExists(email) {
        try {
            if (!email) {
                throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
            }

            email = validateEmail(email);

            const query = {
                text: `SELECT * FROM user_view
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
            console.error(`Error in UserService.getUserByEmailIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * gets all users if exists
     * @returns {Promise<Array>} array of user objects
     * @throws {AppError} if any issue occurs
     */
    static async getUsersIfExists() {
        try {
            const query = {
                text: `SELECT * FROM user_view`,
            };
            const result = await DatabaseService.query(query.text);
            if (result.rowCount === 0) {
                throw new AppError(`No users found`, STATUS_CODES.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in UserService.getUsersIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * inserts user if not exists
     * @param {string} email - user email
     * @param {string} password - user password
     * @returns {Promise<Object>} user object
     * @throws {AppError} if any issue occurs
     */
    static async insertUserIfNotExists(email, password) {
        try {
            if (!email) {
                throw new AppError("Email is required", STATUS_CODES.BAD_REQUEST);
            }

            email = validateEmail(email);

            if (!password) {
                throw new AppError("Password is required", STATUS_CODES.BAD_REQUEST);
            }

            const hashedPassword = await hashPasswordUtil(password);

            const query = {
                text: `INSERT INTO "user"
                (email, password_hash)
                VALUES
                ($1, $2)
                ON CONFLICT (email)
                DO
                UPDATE
                SET email = EXCLUDED.email
                RETURNING *`,
                values: [email, hashedPassword]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(`Error inserting user`, STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in UserService.insertUserIfNotExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * deletes user by user_id
     * @param {number} user_id - user id
     * @returns {Promise<boolean>} true if user deleted, false otherwise
     * @throws {AppError} if any issue occurs
     */
    static async deleteUser(user_id) {
        try {
            if (!user_id) {
                throw new AppError('user_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `DELETE FROM "user"
                WHERE
                user_id = $1
                RETURNING *`,
                values: [user_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(`Error deleting user`, STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in UserService.deleteUser: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * compares email and password to see if they match
     * @param {string} email - user email
     * @param {string} password - user password
     * @returns {Promise<Object|boolean>} user object if email and password match, false otherwise
     * @throws {AppError} if any issue occurs
     */
    static async compareEmailAndPassword(email, password) {
        try {
            if (!email) {
                throw new AppError('email is required', STATUS_CODES.BAD_REQUEST);
            }

            email = validateEmail(email);

            if (!password) {
                throw new AppError('password is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM "user"
                WHERE
                email = $1`,
                values: [email]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Invalid Credentials', STATUS_CODES.UNAUTHORIZED);
            }

            const isPasswordValid = await comparePasswordUtil(password, result.rows[0].password_hash);
            if (!isPasswordValid) {
                throw new AppError("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
            }

            delete result.rows[0].password_hash;

            return result.rows[0];
        } catch (error) {
            console.error(`Error in UserService.compareEmailAndPassword: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { UserService };