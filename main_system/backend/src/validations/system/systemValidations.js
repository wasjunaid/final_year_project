const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { VALID_ROLES_OBJECT } = require('../auth/authValidations');

const SYSTEM_CONFIG = {
    SYSTEM_ADMIN_ROLE_MAX_LENGTH: 15
};

const VALID_SYSTEM_ADMIN_ROLES = [
    VALID_ROLES_OBJECT.SUPER_ADMIN,
    VALID_ROLES_OBJECT.ADMIN
];

/**
 * Validates the role field for a system admin.
 * @param {string} role - The role to validate.
 * @returns {object} The normalized fields.
 * @throws {AppError} if validation fails
 */
const validateRoleField = (role) => {
    if (!role) {
        throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof role !== 'string') {
        throw new AppError("role must be a string", STATUS_CODES.BAD_REQUEST);
    }

    role = role.trim().toLowerCase();

    if (role.length === 0) {
        throw new AppError("role cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    if (role.length > SYSTEM_CONFIG.SYSTEM_ADMIN_ROLE_MAX_LENGTH) {
        throw new AppError(`role must be at most ${SYSTEM_CONFIG.SYSTEM_ADMIN_ROLE_MAX_LENGTH} characters long`, STATUS_CODES.BAD_REQUEST);
    }

    if (!VALID_SYSTEM_ADMIN_ROLES.includes(role)) {
        throw new AppError(`invalid role`, STATUS_CODES.BAD_REQUEST);
    }

    return { role };
}

module.exports = {
    SYSTEM_CONFIG,
    VALID_SYSTEM_ADMIN_ROLES,
    validateRoleField
};