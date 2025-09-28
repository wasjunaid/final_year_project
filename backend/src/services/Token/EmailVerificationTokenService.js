const { pool } = require("../../config/databaseConfig");
const { generateTokenDataUtil } = require("../../utils/generateTokenDataUtil");
const { PersonService } = require("../Person/PersonService");
const { EmailService } = require("../Email/EmailService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class EmailVerificationTokenService {
    static async insertOrUpdateEmailVerificationToken(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const TokenData = generateTokenDataUtil('email_verification_token');
            if (!TokenData.token || !TokenData.expires_at) {
                throw new AppError("Failed to generate token data", statusCodes.INTERNAL_SERVER_ERROR);
            }

            const query = {
                text: `INSERT INTO email_verification_token
                (person_id, token, expires_at)
                VALUES
                ($1, $2, $3)
                ON CONFLICT (person_id) DO UPDATE SET
                token = $2,
                expires_at = $3,
                created_at = CURRENT_TIMESTAMP
                RETURNING *`,
                values: [person_id, TokenData.token, TokenData.expires_at]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error inserting or updating email verification token", statusCodes.INTERNAL_SERVER_ERROR);
            }

            const person = await PersonService.getPerson(person_id);

            await EmailService.sendVerificationEmail(person.email, TokenData.token);
        } catch (error) {
            console.error(`Error inserting or updating email verification token: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async verifyEmail(token) {
        if (!token) {
            throw new AppError("token is required", statusCodes.BAD_REQUEST);
        }

        try {
            const person = await PersonService.updatePersonIsVerified(token);
            if (!person) {
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Error verifying email: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { EmailVerificationTokenService };