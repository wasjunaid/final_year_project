const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { validateID } = require("../../utils/idUtil");

/**
 * Validates fields for inserting a log entry
 * @param {Object} params - log fields
 * @param {number} params.person_id - ID of the person performing the action
 * @param {string} params.action - action performed
 * @returns {Object} normalized fields
 * @throws {AppError} if validation fails
 */
const validateFieldsForInsertLog = ({ person_id, action }) => {
    if (!person_id) {
        throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!action) {
        throw new AppError("action is required", STATUS_CODES.BAD_REQUEST);
    }

    try {
        person_id = validateID(person_id);
    } catch (error) {
        throw error;
    }

    if (typeof action !== 'string') {
        throw new AppError("action must be a string", STATUS_CODES.BAD_REQUEST);
    }

    action = action.trim();

    if (action.length === 0) {
        throw new AppError("action cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    return { person_id, action };
}

module.exports = {
    validateFieldsForInsertLog
};