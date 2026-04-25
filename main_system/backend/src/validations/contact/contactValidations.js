const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

const COUNTRY_CODE_CONFIG = {
    COUNTRY_CODE_MIN_LENGTH: 2, // + followed by at least 1 digit
    COUNTRY_CODE_MAX_LENGTH: 5, // + followed by up to 4 digits
    COUNTRY_CODE_REGEX: /^\+\d{1,4}$/, // + followed by 1-4 digits
    DEFAULT_COUNTRY_CODE: '+92', // Default country code
};

const NUMBER_CONFIG = {
    NUMBER_MIN_LENGTH: 7,  // Minimum 7 digits for phone numbers
    NUMBER_MAX_LENGTH: 15, // Up to 15 digits for phone numbers
    NUMBER_REGEX: /^\d{7,15}$/, // 7 to 15 digits
};

/**
 * Validates the fields for inserting a contact if it does not exist.
 * @param {Object} params - The contact details.
 * @param {string} params.country_code - The country code of the contact.
 * @param {string} params.number - The phone number of the contact.
 * @return {Object} An object containing normalized country_code and number.
 * @throws {AppError} If any validation fails.
 */
const validateFieldsForInsertContactIfNotExists = ({ country_code, number }) => {
    if (!country_code) {
        throw new AppError("country_code is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof country_code !== 'string') {
        throw new AppError("country_code must be a string", STATUS_CODES.BAD_REQUEST);
    }

    country_code = country_code.trim();

    if (country_code.length === 0) {
        throw new AppError("country_code cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    if (country_code.length < COUNTRY_CODE_CONFIG.COUNTRY_CODE_MIN_LENGTH || country_code.length > COUNTRY_CODE_CONFIG.COUNTRY_CODE_MAX_LENGTH) {
        throw new AppError(`country_code must be between ${COUNTRY_CODE_CONFIG.COUNTRY_CODE_MIN_LENGTH} to ${COUNTRY_CODE_CONFIG.COUNTRY_CODE_MAX_LENGTH} characters long`, STATUS_CODES.BAD_REQUEST);
    }

    if (!COUNTRY_CODE_CONFIG.COUNTRY_CODE_REGEX.test(country_code)) {
        throw new AppError("country_code must be + followed by 1-4 digits", STATUS_CODES.BAD_REQUEST);
    }

    if (!number) {
        throw new AppError("number is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof number !== 'string') {
        throw new AppError("number must be a string", STATUS_CODES.BAD_REQUEST);
    }

    number = number.trim();

    if (number.length === 0) {
        throw new AppError("number cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    if (number.length < NUMBER_CONFIG.NUMBER_MIN_LENGTH || number.length > NUMBER_CONFIG.NUMBER_MAX_LENGTH) {
        throw new AppError(`number must be between ${NUMBER_CONFIG.NUMBER_MIN_LENGTH} to ${NUMBER_CONFIG.NUMBER_MAX_LENGTH} digits`, STATUS_CODES.BAD_REQUEST);
    }

    if (!NUMBER_CONFIG.NUMBER_REGEX.test(number)) {
        throw new AppError(`number must be between ${NUMBER_CONFIG.NUMBER_MIN_LENGTH} to ${NUMBER_CONFIG.NUMBER_MAX_LENGTH} digits`, STATUS_CODES.BAD_REQUEST);
    }

    return { country_code, number };
};

module.exports = {
    COUNTRY_CODE_CONFIG,
    NUMBER_CONFIG,
    validateFieldsForInsertContactIfNotExists
};