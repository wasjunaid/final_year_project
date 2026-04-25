const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

/**
 * Validates fields for inserting an address if it does not exist.
 * @param {string} address address to be validated
 * @returns {Object} normalized fields (address)
 * @throws {AppError} if any validation fails
 */
const validateFieldsForInsertAddressIfNotExists = (address) => {
    if (!address) {
        throw new AppError('Address is required', STATUS_CODES.BAD_REQUEST);
    }

    if (typeof address !== 'string') {
        throw new AppError('Address must be a string', STATUS_CODES.BAD_REQUEST);
    }

    address = address.trim().toLowerCase();

    if (address.length === 0) {
        throw new AppError('Address cannot be empty', STATUS_CODES.BAD_REQUEST);
    }

    return { address };
};

module.exports = {
    validateFieldsForInsertAddressIfNotExists
};