const crypto = require("crypto");
const { STATUS_CODES } = require("./statusCodesUtil");
const { AppError } = require("../classes/AppErrorClass");

const TOKEN_CONFIG = {
    TOKEN_TYPE_MAX_LENGTH: 20,
    BYTES: 32,
    FORMAT: 'hex',
    TOKEN_EXPIRY: {
        email_verification: 24 * 60 * 60 * 1000, // 24 hours
        password_reset: 15 * 60 * 1000 // 15 minutes
    }
};

const VALID_TOKEN_TYPES_OBJECT = {
    EMAIL_VERIFICATION: 'email_verification',
    PASSWORD_RESET: 'password_reset'
};

const VALID_TOKEN_TYPES = Object.values(VALID_TOKEN_TYPES_OBJECT);

/**
 * Generates token data including token string and expiry date
 * @param {string} token_type - type of token to generate
 * @returns {Object} token data including token string and expiry date
 * @throws {AppError} if any issue occurs
 */
const generateTokenDataUtil = (token_type) => {
    try {
        if (!token_type) {
            throw new AppError("token_type is required", STATUS_CODES.BAD_REQUEST);
        }
        if (typeof token_type !== 'string') {
            throw new AppError("token_type must be a string", STATUS_CODES.BAD_REQUEST);
        }
        if (!VALID_TOKEN_TYPES.includes(token_type)) {
            throw new AppError("Invalid token_type must be one of the following: " + VALID_TOKEN_TYPES.join(", "), STATUS_CODES.BAD_REQUEST);
        }

        const tokenData = {
            // token: crypto.randomBytes(TOKEN_CONFIG.BYTES).toString(TOKEN_CONFIG.FORMAT),
            token: "test-token",
            expires_at: new Date(Date.now() + (
                token_type === VALID_TOKEN_TYPES_OBJECT.EMAIL_VERIFICATION
                    ? TOKEN_CONFIG.TOKEN_EXPIRY.email_verification
                    : TOKEN_CONFIG.TOKEN_EXPIRY.password_reset
            ))
        };

        return tokenData;
    } catch (error) {
        console.error(`Error in tokenUtil.generateTokenDataUtil: ${error.message} ${error.status}`);
        throw error;
    }
}

module.exports = {
    TOKEN_CONFIG,
    VALID_TOKEN_TYPES_OBJECT,
    VALID_TOKEN_TYPES,
    generateTokenDataUtil
};