const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

const MEDICINE_CONFIG = {
    MEDICINE_NAME_MAX_LENGTH: 255
}

/**
 * Validates the fields for inserting a new medicine.
 * @param {Object} params parameters object
 * @param {string} params.name name of the medicine
 * @returns {Object} validated and sanitized fields
 * @throws {AppError} if any validation fails
 */
const validateFieldsForInsertMedicine = ({ name })  => {
    if (!name) {
        throw new AppError("Medicine name is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof name !== 'string') {
        throw new AppError("Medicine name must be a string", STATUS_CODES.BAD_REQUEST);
    }

    name = name.trim().toLowerCase();

    if (name.length === 0) {
        throw new AppError("Medicine name cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    if (name.length > MEDICINE_CONFIG.MEDICINE_NAME_MAX_LENGTH) {
        throw new AppError(`Medicine name cannot exceed ${MEDICINE_CONFIG.MEDICINE_NAME_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
    }

    return { name };
}

module.exports = {
    MEDICINE_CONFIG,
    validateFieldsForInsertMedicine
};