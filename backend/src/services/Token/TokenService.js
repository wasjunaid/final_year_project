const { pool } = require("../../config/databaseConfig");
const { tokenTypes } = require("../../utils/generateTokenDataUtil");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class TokenService {
    static async getValidToken(token, tokenType) {
        if (!token) {
            throw new AppError("token is required", statusCodes.BAD_REQUEST);
        }
        if (!tokenTypes) {
            throw new AppError("tokenType is required", statusCodes.BAD_REQUEST);
        }
        if (!tokenTypes.includes(tokenType)) {
            throw new AppError("Invalid token type", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM ${tokenType}
                WHERE
                token = $1 AND expires_at > NOW()`,
                values: [token]
            }
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Token is invalid or not found", statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error retrieving ${tokenType}: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async deleteToken(person_id, tokenType) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!tokenType) {
            throw new AppError("tokenType is required", statusCodes.BAD_REQUEST);
        }
        if (!tokenTypes.includes(tokenType)) {
            throw new AppError("Invalid token type", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM ${tokenType}
                WHERE
                person_id = $1
                RETURNING *`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error deleting ${tokenType} or token not found`, statusCodes.NOT_FOUND);
            }
        } catch (error) {
            throw new AppError(`Error deleting ${tokenType}: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { TokenService };