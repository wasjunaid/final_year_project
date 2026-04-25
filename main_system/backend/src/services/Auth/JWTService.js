const jwt = require("jsonwebtoken");
const { JWTConfig } = require("../../config/JWTConfig");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { validateFieldsForGenerateJWT, validateFieldsForRefreshJWT } = require("../../validations/auth/jwtValidations");

class JWTService {
    /**
     * Generates JWT access and refresh tokens for a user.
     * @param {number} person_id - The ID of the person.
     * @param {string} role - The role of the person.
     * @returns {Promise<{accessToken: string, refreshToken: string}>} The generated tokens.
     * @throws {AppError} if any issue occurs
     */
    static async generateJWT(person_id, role) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ person_id, role } = validateFieldsForGenerateJWT({ person_id, role }));

            const accessToken = jwt.sign({
                person_id: person_id,
                role: role
            },
                JWTConfig.accessSecret,
                { expiresIn: JWTConfig.accessExpiry }
            );
            if (!accessToken) {
                throw new AppError("Failed to generate access token", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            const refreshToken = jwt.sign({
                person_id: person_id,
                role: role
            },
                JWTConfig.refreshSecret,
                { expiresIn: JWTConfig.refreshExpiry }
            );
            if (!refreshToken) {
                throw new AppError("Failed to generate refresh token", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return { accessToken, refreshToken };
        } catch (error) {
            console.error(`Error in JWTService.generateJWT: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Refreshes JWT tokens using a valid refresh token.
     * @param {string} refreshToken - The refresh token.
     * @returns {Promise<{accessToken: string, refreshToken: string}>} The new generated tokens.
     * @throws {AppError} if any issue occurs
     */
    static async refreshJWT(refreshToken) {
        try {
            if (!refreshToken) {
                throw new AppError("refreshToken is required", STATUS_CODES.BAD_REQUEST);
            }

            validateFieldsForRefreshJWT(refreshToken);

            const decodedToken = jwt.verify(refreshToken, JWTConfig.refreshSecret);
            if (!decodedToken) {
                throw new AppError("Invalid refresh token", STATUS_CODES.UNAUTHORIZED);
            }

            const newTokens = await this.generateJWT(decodedToken.person_id, decodedToken.role);

            return newTokens;
        } catch (error) {
            console.error(`Error in JWTService.refreshJWT: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { JWTService }