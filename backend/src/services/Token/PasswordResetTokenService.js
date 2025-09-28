const { pool } = require("../../config/databaseConfig");
const { generateTokenDataUtil } = require("../../utils/generateTokenDataUtil");
const { PersonService } = require("../Person/PersonService");
const { EmailService } = require("../Email/EmailService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class PasswordResetTokenService {
    static async insertOrUpdatePasswordResetToken(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const TokenData = generateTokenDataUtil('password_reset_token');
            if (!TokenData.token || !TokenData.expires_at) {
                throw new AppError("Failed to generate token data", statusCodes.INTERNAL_SERVER_ERROR);
            }

            const query = {
                text: `INSERT INTO password_reset_token
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
                throw new AppError("Error inserting or updating password reset token", statusCodes.INTERNAL_SERVER_ERROR);
            }

            const person = await PersonService.getPerson(person_id);

            await EmailService.sendPasswordResetEmail(person.email, TokenData.token);
        } catch (error) {
            throw new AppError(`Error inserting or updating password reset token: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async resetPassword(token, password) {
        if (!token) {
            throw new AppError("token is required", statusCodes.BAD_REQUEST);
        }
        if (!password) {
            throw new AppError("password is required", statusCodes.BAD_REQUEST);
        }

        try {
            const person = await PersonService.updatePersonPasswordHash(token, password);
            if (!person) {
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Error resetting password: ${error}`);
            throw new AppError(`Error resetting password: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { PasswordResetTokenService };