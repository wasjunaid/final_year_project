const jwt = require("jsonwebtoken");
const { JWTConfig } = require("../../config/JWTConfig");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { VALID_ROLES_FOR_SIGN_IN } = require("../../utils/validConstantsUtil");

class JWTService {
    /**
     * Generates JWT tokens (access and refresh) for a user
     * @param {number} user_id id of the user
     * @param {string} role role of the user
     * @returns {Object} Object containing accessToken and refreshToken
     * @throws {AppError} Throws error if inputs are invalid or token generation fails
     */
    static async generateJWT(user_id, role) {
        if(!user_id) {
            throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
        }
        if(!role) {
            throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
        }
        if(!VALID_ROLES_FOR_SIGN_IN.includes(role.toLowerCase())) {
            throw new AppError("Invalid role provided", STATUS_CODES.BAD_REQUEST);
        }

        let JWTResponse = {
            accessToken: "",
            refreshToken: ""
        };

        JWTResponse.accessToken = jwt.sign({
            user_id: user_id,
            role: role
        },
            JWTConfig.accessSecret,
            { expiresIn: JWTConfig.accessExpiry }
        );
        if (!JWTResponse.accessToken) {
            throw new AppError("Failed to generate access token", STATUS_CODES.INTERNAL_SERVER_ERROR);
        }

        JWTResponse.refreshToken = jwt.sign({
            user_id: user_id,
            role: role
        },
            JWTConfig.refreshSecret,
            { expiresIn: JWTConfig.refreshExpiry }
        );
        if (!JWTResponse.refreshToken) {
            throw new AppError("Failed to generate refresh token", STATUS_CODES.INTERNAL_SERVER_ERROR);
        }

        return JWTResponse;
    }

    /**
     * Refreshes JWT tokens using a valid refresh token
     * @param {string} refreshToken The refresh token
     * @returns {Object} Object containing new accessToken and refreshToken
     * @throws {AppError} Throws error if refresh token is invalid or token generation fails
     */
    static async refreshJWT(refreshToken) {
        if(!refreshToken) {
            throw new AppError("refreshToken is required", STATUS_CODES.BAD_REQUEST);
        }

        const decodedToken = jwt.verify(refreshToken, JWTConfig.refreshSecret);
        if (!decodedToken) {
            throw new AppError("Invalid refresh token", STATUS_CODES.UNAUTHORIZED);
        }

        try {
            const newTokens = await this.generateJWT(decodedToken.user_id, decodedToken.role);

            return newTokens;
        } catch (error) {
            console.error(`Error in JWTService.refreshJWT: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { JWTService }