const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { validateID } = require("../../utils/idUtil");
const { AUTH_CONFIG, VALID_ROLES_FOR_SIGN_IN } = require("./authValidations");

/**
 * Validates fields for generating JWT.
 * @param {Object} params parameters object
 * @param {number} params.person_id ID of the person
 * @param {string} params.role role of the user
 * @returns {Object} normalized fields (person_id and role)
 * @throws {AppError} if any validation fails
 */
const validateFieldsForGenerateJWT = ({ person_id, role }) => {
    if (!person_id) {
        throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
    }

    try {
        person_id = validateID(person_id);
    } catch (error) {
        throw error;
    }

    if (!role) {
        throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof role !== 'string') {
        throw new AppError("role must be a string", STATUS_CODES.BAD_REQUEST);
    }

    role = role.trim().toLowerCase();

    if (role.length === 0) {
        throw new AppError("role cannot be an empty string", STATUS_CODES.BAD_REQUEST);
    }

    if (role.length > AUTH_CONFIG.ROLE_MAX_LENGTH) {
        throw new AppError(`role must be at most ${AUTH_CONFIG.ROLE_MAX_LENGTH} characters long`, STATUS_CODES.BAD_REQUEST);
    }

    if (!VALID_ROLES_FOR_SIGN_IN.includes(role)) {
        throw new AppError("Invalid role", STATUS_CODES.BAD_REQUEST);
    }

    return { person_id, role };
};

/** * Validates fields for refreshing JWT.
 * @param {string} refreshToken refresh token
 * @throws {AppError} if any validation fails
 */
const validateFieldsForRefreshJWT = (refreshToken) => {
    if (!refreshToken) {
        throw new AppError("refreshToken is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof refreshToken !== 'string') {
        throw new AppError("refreshToken must be a string", STATUS_CODES.BAD_REQUEST);
    }
};

module.exports = {
    validateFieldsForGenerateJWT,
    validateFieldsForRefreshJWT
};