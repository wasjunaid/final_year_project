const { STATUS_CODES } = require('../../utils/statusCodesUtil');
const { AppError } = require('../../classes/AppErrorClass');
const { validateID } = require('../../utils/idUtil');
const {
    AUTH_CONFIG,
    VALID_ROLES
} = require('../auth/authValidations');
const { VALID_TABLES } = require('../../utils/validConstantsUtil');
const { validateEmail } = require('../../utils/emailUtil');

const NOTIFICATION_CONFIG = {
    NOTIFICATION_TITLE_MAX_LENGTH: 255,
    NOTIFICATION_TYPE_MAX_LENGTH: 30,
    NOTIFICATION_RELATED_TABLE_MAX_LENGTH: 50
};

const VALID_NOTIFICATION_TYPES_OBJECT = {
    GENERAL: 'general',
    APPOINTMENT: 'appointment',
    MEDICAL: 'medical',
    SYSTEM: 'system',
    ALERT: 'alert',
    REMINDER: 'reminder'
};

const VALID_NOTIFICATION_TYPES = Object.values(VALID_NOTIFICATION_TYPES_OBJECT);

/**
 * Validates ID fields for notification operations.
 * @param {Object} params - The parameters object.
 * @param {number|string} [params.person_id] - The person ID to validate.
 * @param {number|string} [params.notification_id] - The notification ID to validate.
 * @returns {Object} - An object containing the normalized ID fields.
 * @throws {AppError} - If any ID is invalid.
 */
const validateIDFieldsForNotification = ({ person_id, notification_id }) => {
    const res = {};

    if (person_id !== undefined) {
        try {
            res.person_id = validateID(person_id);
        } catch (error) {
            throw error;
        }
    }

    if (notification_id !== undefined) {
        try {
            res.notification_id = validateID(notification_id);
        } catch (error) {
            throw error;
        }
    }

    return res;
}

/**
 * Validates ID and role fields for notification operations.
 * @param {Object} params - The parameters object.
 * @param {number|string} params.person_id - The person ID to validate.
 * @param {string} params.role - The role to validate.
 * @returns {Object} - An object containing the normalized person_id and role.
 * @throws {AppError} - If any field is invalid.
 */
const validateIDandRoleFieldsForNotification = ({ person_id, role }) => {
    if (!person_id) {
        throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!role) {
        throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
    }

    try {
        person_id = validateID(person_id);
    } catch (error) {
        throw error;
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

    if (!VALID_ROLES.includes(role)) {
        throw new AppError("role is invalid must be one of: " + VALID_ROLES.join(", "), STATUS_CODES.BAD_REQUEST);
    }

    return { person_id, role };
}

/**
 * Validates fields for inserting a new notification.
 * @param {Object} params - The parameters object.
 * @param {number|string} params.person_id - The person ID.
 * @param {string} params.role - The role.
 * @param {string} params.title - The notification title.
 * @param {string} params.message - The notification message.
 * @param {string} params.type - The notification type.
 * @param {number|string} [params.related_id] - The related entity ID.
 * @param {string} [params.related_table] - The related entity table.
 * @param {string} [params.email] - The email to send the notification to.
 * @param {boolean} [params.sendEmail] - Whether to send an email.
 * @returns {Object} - An object containing the normalized fields.
 * @throws {AppError} - If any field is invalid.
 */
const validateFieldsForInsertNotification = ({ person_id, role, title, message, type, related_id, related_table, email, sendEmail }) => {
    if (!person_id) {
        throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!role) {
        throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!title) {
        throw new AppError("title is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!message) {
        throw new AppError("message is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!type) {
        throw new AppError("type is required", STATUS_CODES.BAD_REQUEST);
    }

    try {
        ({ person_id, role } = validateIDandRoleFieldsForNotification({ person_id, role }));
    } catch (error) {
        throw error;
    }

    if (typeof title !== 'string') {
        throw new AppError("title must be a string", STATUS_CODES.BAD_REQUEST);
    }

    title = title.trim();

    if (title.length === 0) {
        throw new AppError("title cannot be an empty string", STATUS_CODES.BAD_REQUEST);
    }

    if (title.length > NOTIFICATION_CONFIG.NOTIFICATION_TITLE_MAX_LENGTH) {
        throw new AppError(`title must be at most ${NOTIFICATION_CONFIG.NOTIFICATION_TITLE_MAX_LENGTH} characters long`, STATUS_CODES.BAD_REQUEST);
    }

    if (typeof message !== 'string') {
        throw new AppError("message must be a string", STATUS_CODES.BAD_REQUEST);
    }

    message = message.trim();

    if (message.length === 0) {
        throw new AppError("message cannot be an empty string", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof type !== 'string') {
        throw new AppError("type must be a string", STATUS_CODES.BAD_REQUEST);
    }

    type = type.trim().toLowerCase();

    if (type.length === 0) {
        throw new AppError("type cannot be an empty string", STATUS_CODES.BAD_REQUEST);
    }

    if (type.length > NOTIFICATION_CONFIG.NOTIFICATION_TYPE_MAX_LENGTH) {
        throw new AppError(`type must be at most ${NOTIFICATION_CONFIG.NOTIFICATION_TYPE_MAX_LENGTH} characters long`, STATUS_CODES.BAD_REQUEST);
    }

    if (!VALID_NOTIFICATION_TYPES.includes(type)) {
        throw new AppError("type is invalid must be one of: " + VALID_NOTIFICATION_TYPES.join(", "), STATUS_CODES.BAD_REQUEST);
    }

    if (related_id) {
        if (!related_table) {
            throw new AppError("related_table is required when related_id is provided", STATUS_CODES.BAD_REQUEST);
        }

        related_id = validateID(related_id);
    }

    if (related_table) {
        if (!related_id) {
            throw new AppError("related_id is required when related_table is provided", STATUS_CODES.BAD_REQUEST);
        }

        if (typeof related_table !== 'string') {
            throw new AppError("related_table must be a string", STATUS_CODES.BAD_REQUEST);
        }

        related_table = related_table.trim().toLowerCase();

        if (related_table.length === 0) {
            throw new AppError("related_table cannot be an empty string", STATUS_CODES.BAD_REQUEST);
        }

        if (related_table.length > NOTIFICATION_CONFIG.NOTIFICATION_RELATED_TABLE_MAX_LENGTH) {
            throw new AppError(`related_table must be at most ${NOTIFICATION_CONFIG.NOTIFICATION_RELATED_TABLE_MAX_LENGTH} characters long`, STATUS_CODES.BAD_REQUEST);
        }

        if (!VALID_TABLES.includes(related_table)) {
            throw new AppError("related_table is invalid must be one of: " + VALID_TABLES.join(", "), STATUS_CODES.BAD_REQUEST);
        }
    }

    if (email && sendEmail) {
        email = validateEmail(email);
    }

    if (typeof sendEmail !== 'boolean') {
        sendEmail = false;
    }

    return { person_id, role, title, message, type, related_id, related_table, email, sendEmail };
}

module.exports = {
    NOTIFICATION_CONFIG,
    VALID_NOTIFICATION_TYPES_OBJECT,
    VALID_NOTIFICATION_TYPES,
    validateIDFieldsForNotification,
    validateIDandRoleFieldsForNotification,
    validateFieldsForInsertNotification
};