const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const {
    TOKEN_CONFIG,
    VALID_TOKEN_TYPES
} = require("../../utils/tokenUtil");
const { validateEmail } = require("../../utils/emailUtil");

/**
 * Validates the token_type field.
 * @param {string} token_type - The type of the token.
 * @returns {string} The validated token_type.
 * @throws {AppError} if validation fails
 */
const validateTokenTypeField = (token_type) => {
    if (!token_type) {
        throw new AppError("token_type is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof token_type !== 'string') {
        throw new AppError("token_type must be a string", STATUS_CODES.BAD_REQUEST);
    }

    token_type = token_type.trim().toLowerCase();

    if (token_type.length === 0) {
        throw new AppError("token_type cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    if (token_type.length > TOKEN_CONFIG.TOKEN_TYPE_MAX_LENGTH) {
        throw new AppError(`token_type cannot exceed ${TOKEN_CONFIG.TOKEN_TYPE_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
    }

    if (!VALID_TOKEN_TYPES.includes(token_type)) {
        throw new AppError("Invalid token_type must be one of the following: " + VALID_TOKEN_TYPES.join(", "), STATUS_CODES.BAD_REQUEST);
    }

    return token_type;
}

/**
 * Validates the token fields.
 * @param {object} params - The parameters object.
 * @param {string} params.token - The token string.
 * @param {string} params.token_type - The type of the token.
 * @returns {object} The normalized fields.
 * @throws {AppError} if validation fails
 */
const validateTokenFields = ({ token, token_type }) => {
    if (!token) {
        throw new AppError("token is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!token_type) {
        throw new AppError("token_type is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof token !== 'string') {
        throw new AppError("token must be a string", STATUS_CODES.BAD_REQUEST);
    }

    try {
        token_type = validateTokenTypeField(token_type);
    } catch (error) {
        throw error;
    }

    return { token_type };
}

/** * Validates fields for inserting or updating a token.
 * @param {object} params - The parameters object.
 * @param {string} params.email - The email associated with the token.
 * @param {string} params.token_type - The type of the token.
 * @returns {object} The normalized fields.
 * @throws {AppError} if validation fails
 */
const validateFieldsForInsertOrUpdateToken = ({ email, token_type }) => {
    if (!email) {
        throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!token_type) {
        throw new AppError("token_type is required", STATUS_CODES.BAD_REQUEST);
    }

    try {
        email = validateEmail(email);
    } catch (error) {
        throw error;
    }

    try {
        token_type = validateTokenTypeField(token_type);
    } catch (error) {
        throw error;
    }

    return { email, token_type };
}

module.exports = {
    validateTokenFields,
    validateFieldsForInsertOrUpdateToken
};