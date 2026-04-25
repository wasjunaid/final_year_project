const bcrypt = require("bcrypt");
const { STATUS_CODES } = require("./statusCodesUtil");
const { AppError } = require("../classes/AppErrorClass");

// Password validation configuration
const PASSWORD_CONFIG = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    MIN_SALT_ROUNDS: 10,
    MAX_SALT_ROUNDS: 15,
    DEFAULT_SALT_ROUNDS: 12
};

/**
 * Validates password format and security requirements
 * @param {string} password - password to validate
 * @returns {boolean} true if valid
 * @throws {AppError} if any issue occurs
 */
const validatePasswordStrength = (password) => {
    if (typeof password !== 'string') {
        throw new AppError("Password must be a string", STATUS_CODES.BAD_REQUEST);
    }

    if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
        throw new AppError(`Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters long`, STATUS_CODES.BAD_REQUEST);
    }

    if (password.length > PASSWORD_CONFIG.MAX_LENGTH) {
        throw new AppError(`Password must not exceed ${PASSWORD_CONFIG.MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        throw new AppError("Password must contain at least one uppercase letter", STATUS_CODES.BAD_REQUEST);
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        throw new AppError("Password must contain at least one lowercase letter", STATUS_CODES.BAD_REQUEST);
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
        throw new AppError("Password must contain at least one number", STATUS_CODES.BAD_REQUEST);
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        throw new AppError("Password must contain at least one special character", STATUS_CODES.BAD_REQUEST);
    }

    // Check for common weak patterns
    if (/(.)\1{2,}/.test(password)) {
        throw new AppError("Password cannot contain 3 or more consecutive identical characters", STATUS_CODES.BAD_REQUEST);
    }

    return true;
};

/**
 * Validates password format and security requirements and hashes it
 * @param {string} password - password to hash
 * @param {number} saltRounds - bcrypt salt rounds (default: 12)
 * @returns {Promise<string>} password hash
 * @throws {AppError} if any issue occurs
 */
const hashPasswordUtil = async (password, options = {}) => {
    try {
        const {
            saltRounds = PASSWORD_CONFIG.DEFAULT_SALT_ROUNDS,
            validateStrength = true
        } = options;
        
        if (!password) {
            throw new AppError("password is required", STATUS_CODES.BAD_REQUEST);
        }

        // Validate password strength
        if (validateStrength) {
            validatePasswordStrength(password);
        }

        // Validate salt rounds
        if (typeof saltRounds !== "number" || !Number.isInteger(saltRounds)) {
            throw new AppError("saltRounds must be an integer", STATUS_CODES.BAD_REQUEST);
        }

        if (saltRounds < 0) {
            throw new AppError("saltRounds cannot be negative", STATUS_CODES.BAD_REQUEST);
        }

        if (saltRounds < PASSWORD_CONFIG.MIN_SALT_ROUNDS || saltRounds > PASSWORD_CONFIG.MAX_SALT_ROUNDS) {
            throw new AppError(
                `saltRounds must be between ${PASSWORD_CONFIG.MIN_SALT_ROUNDS} and ${PASSWORD_CONFIG.MAX_SALT_ROUNDS}`,
                STATUS_CODES.BAD_REQUEST
            );
        }

        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.error(`Error in passwordUtil.hashPasswordUtil: ${error.message} ${error.status}`);
        throw error;
    }
}

/**
 * compares password with hashed password to see if they match
 * @param {string} password - password to compare
 * @param {string} password_hash - hashed password to compare with
 * @returns {Promise<boolean>} true if matches
 * @throws {AppError} if any issue occurs
 */
const comparePasswordUtil = async (password, password_hash) => {
    try {
        if (!password) {
            throw new AppError("password is required", STATUS_CODES.BAD_REQUEST);
        }

        if (typeof password !== 'string') {
            throw new AppError("password must be a string", STATUS_CODES.BAD_REQUEST);
        }

        if (!password_hash) {
            throw new AppError("password_hash is required", STATUS_CODES.BAD_REQUEST);
        }

        if (typeof password_hash !== 'string') {
            throw new AppError("password_hash must be a string", STATUS_CODES.BAD_REQUEST);
        }

        return await bcrypt.compare(password, password_hash);
    } catch (error) {
        console.error(`Error in passwordUtil.comparePasswordUtil: ${error.message} ${error.status}`);
        throw error;
    }
}

module.exports = {
    PASSWORD_CONFIG,
    validatePasswordStrength,
    hashPasswordUtil,
    comparePasswordUtil
}