const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const {
    VALID_TOKEN_TYPES_OBJECT,
    generateTokenDataUtil
} = require("../../utils/tokenUtil");
const {
    validateTokenFields,
    validateFieldsForInsertOrUpdateToken
} = require("../../validations/token/tokenValidations");
const { PersonService } = require("../Person/PersonService");
const { EmailService } = require("../Email/EmailService");

class TokenService {
    /**
     * Validates and retrieves a valid token from the database
     * @param {string} token - token string to validate
     * @param {string} token_type - type of token
     * @returns {Promise<Object>} token data if valid
     * @throws {AppError} if any issue occurs
     */
    static async getValidTokenIfExists(token, token_type) {
        try {
            if (!token) {
                throw new AppError("token is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!token_type) {
                throw new AppError("token_type is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ token_type } = validateTokenFields({ token, token_type }));

            const query = {
                text: `
                SELECT * FROM token
                WHERE
                token = $1
                AND
                token_type = $2
                AND
                expires_at > NOW()`,
                values: [token, token_type]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in TokenService.getValidTokenIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts or updates a token for a person and sends corresponding email
     * @param {string} email - email of the person
     * @param {string} token_type - type of token to create (email_verification or password_reset)
     * @returns {Promise<boolean>} true if successful
     * @throws {AppError} if any issue occurs
     */
    static async insertOrUpdateToken(email, token_type) {
        try {
            if (!email) {
                throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!token_type) {
                throw new AppError("token_type is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ email, token_type } = validateFieldsForInsertOrUpdateToken({ email, token_type }));

            const person = await PersonService.getPersonByEmailIfExists(email);
            if (!person) {
                throw new AppError("Person with the provided email does not exist", STATUS_CODES.NOT_FOUND);
            }

            if (person.is_verified && token_type === VALID_TOKEN_TYPES_OBJECT.EMAIL_VERIFICATION) {
                throw new AppError("Person is already verified", STATUS_CODES.BAD_REQUEST);
            }

            const TokenData = generateTokenDataUtil(token_type);

            const query = {
                text: `
                INSERT INTO token
                (person_id, token, expires_at, token_type)
                VALUES
                ($1, $2, $3, $4)
                ON CONFLICT (person_id, token_type)
                DO
                UPDATE
                SET
                token = $2,
                expires_at = $3,
                created_at = CURRENT_TIMESTAMP
                RETURNING *`,
                values: [person.person_id, TokenData.token, TokenData.expires_at, token_type]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error inserting or updating token", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            if (token_type === VALID_TOKEN_TYPES_OBJECT.EMAIL_VERIFICATION) {
                await EmailService.sendVerificationEmail(email, TokenData.token);
            } else if (token_type === VALID_TOKEN_TYPES_OBJECT.PASSWORD_RESET) {
                await EmailService.sendPasswordResetEmail(email, TokenData.token);
            }

            return true;
        } catch (error) {
            console.error(`Error in TokenService.insertOrUpdateToken: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Deletes a token from the database
     * @param {string} token - token to delete
     * @param {string} token_type - type of token to delete
     * @returns {Promise<boolean>} true if deleted
     * @throws {AppError} if any issue occurs
     */
    static async deleteToken(token, token_type) {
        try {
            if (!token) {
                throw new AppError("token is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!token_type) {
                throw new AppError("token_type is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ token_type } = validateTokenFields({ token, token_type }));

            const query = {
                text: `
                DELETE FROM token
                WHERE
                token = $1
                AND
                token_type = $2
                RETURNING *`,
                values: [token, token_type]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(`Error deleting ${token_type} or token not found`, STATUS_CODES.NOT_FOUND);
            }

            return true;
        } catch (error) {
            console.error(`Error in TokenService.deleteToken: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Verifies an email using the provided token
     * @param {string} token - token to verify email
     * @returns {Promise<boolean>} true if email verified
     * @throws {AppError} if any issue occurs
     */
    static async verifyEmailUsingToken(token) {
        try {
            if (!token) {
                throw new AppError("token is required", STATUS_CODES.BAD_REQUEST);
            }

            const tokenData = await this.getValidTokenIfExists(token, VALID_TOKEN_TYPES_OBJECT.EMAIL_VERIFICATION);
            if (!tokenData) {
                throw new AppError("Token is invalid or not found", STATUS_CODES.NOT_FOUND);
            }

            await PersonService.updatePersonIsVerified(tokenData.person_id);

            await this.deleteToken(token, VALID_TOKEN_TYPES_OBJECT.EMAIL_VERIFICATION);

            return true;
        } catch (error) {
            console.error(`Error in TokenService.verifyEmailUsingToken: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Resets a person's password using the provided token
     * @param {string} token - token to verify
     * @param {string} password - new password
     * @returns {Promise<boolean>} true if successful
     * @throws {AppError} if any issue occurs
     */
    static async resetPasswordUsingToken(token, password) {
        try {
            if (!token) {
                throw new AppError("token is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!password) {
                throw new AppError("password is required", STATUS_CODES.BAD_REQUEST);
            }

            const tokenData = await this.getValidTokenIfExists(token, VALID_TOKEN_TYPES_OBJECT.PASSWORD_RESET);
            if (!tokenData) {
                throw new AppError("Token is invalid or not found", STATUS_CODES.NOT_FOUND);
            }

            await PersonService.updatePersonPasswordHash(tokenData.person_id, password);

            await this.deleteToken(token, VALID_TOKEN_TYPES_OBJECT.PASSWORD_RESET);
            
            return true;
        } catch (error) {
            console.error(`Error in TokenService.resetPasswordUsingToken: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { TokenService };