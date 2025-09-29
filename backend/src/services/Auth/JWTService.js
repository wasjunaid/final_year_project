const jwt = require("jsonwebtoken");
const { JWTConfig } = require("../../config/JWTConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class JWTService {
    static async generateJWT(person_id, role) {
        if(!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if(!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }

        let JWTResponse = {
            accessToken: "",
            refreshToken: ""
        };

        JWTResponse.accessToken = jwt.sign({
            person_id: person_id,
            role: role
        },
            JWTConfig.accessSecret,
            { expiresIn: JWTConfig.accessExpiry }
        );
        if (!JWTResponse.accessToken) {
            throw new AppError("Failed to generate access token", statusCodes.INTERNAL_SERVER_ERROR);
        }

        JWTResponse.refreshToken = jwt.sign({
            person_id: person_id,
            role: role
        },
            JWTConfig.refreshSecret,
            { expiresIn: JWTConfig.refreshExpiry }
        );
        if (!JWTResponse.refreshToken) {
            throw new AppError("Failed to generate refresh token", statusCodes.INTERNAL_SERVER_ERROR);
        }

        return JWTResponse;
    }

    static async refreshJWT(refreshToken) {
        if(!refreshToken) {
            throw new AppError("refreshToken is required", statusCodes.BAD_REQUEST);
        }

        const decodedToken = jwt.verify(refreshToken, JWTConfig.refreshSecret);
        if (!decodedToken) {
            throw new AppError("Invalid refresh token", statusCodes.UNAUTHORIZED);
        }

        try {
            const newTokens = await this.generateJWT(decodedToken.person_id, decodedToken.role);

            return newTokens;
        } catch (error) {
            console.error(`Error refreshing tokens: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { JWTService }