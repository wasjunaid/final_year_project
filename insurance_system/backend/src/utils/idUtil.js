const { STATUS_CODES } = require("./statusCodesUtil");
const { AppError } = require("../classes/AppErrorClass");

// ID validation configuration
const ID_CONFIG = {
    MIN_ID: 1,                    // Minimum valid ID value
    MAX_ID: 2147483647,          // PostgreSQL INTEGER max value (32-bit)
    
    // UUID format for external IDs (if needed later)
    UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

/**
 * Validates integer ID format and range
 * @param {number|string} id - ID to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowString - Allow string representation of numbers (default: false)
 * @param {boolean} options.allowZero - Allow zero as valid ID (default: false)
 * @returns {number} validated and normalized ID
 * @throws {AppError} if any issue occurs
 */
const validateID = (id, options = {}) => {
    const {
        allowString = true,
        allowZero = false
    } = options;

    try {
        // Basic null/undefined check
        if (id === null || id === undefined) {
            throw new AppError(`ID is required`, STATUS_CODES.BAD_REQUEST);
        }

        // Handle string numbers
        if (typeof id === 'string') {
            if (!allowString) {
                throw new AppError(`ID must be a number, not a string`, STATUS_CODES.BAD_REQUEST);
            }
            
            // Check if string is empty or just whitespace
            if (id.trim() === '') {
                throw new AppError(`ID cannot be empty`, STATUS_CODES.BAD_REQUEST);
            }
            
            // Convert to number
            const numericID = Number(id.trim());
            
            // Check if conversion was successful
            if (isNaN(numericID)) {
                throw new AppError(`ID must be a valid number`, STATUS_CODES.BAD_REQUEST);
            }
            
            id = numericID;
        }

        // Type validation
        if (typeof id !== 'number') {
            throw new AppError(`ID must be a number`, STATUS_CODES.BAD_REQUEST);
        }

        // Check for decimal numbers
        if (!Number.isInteger(id)) {
            throw new AppError(`ID must be an integer`, STATUS_CODES.BAD_REQUEST);
        }

        // Check for special number values
        if (!Number.isFinite(id)) {
            throw new AppError(`ID must be a finite number`, STATUS_CODES.BAD_REQUEST);
        }

        // Zero validation
        if (id === 0 && !allowZero) {
            throw new AppError(`ID cannot be zero`, STATUS_CODES.BAD_REQUEST);
        }

        // Range validation - all IDs use same range
        if (id < ID_CONFIG.MIN_ID) {
            throw new AppError(`ID must be at least ${ID_CONFIG.MIN_ID}`, STATUS_CODES.BAD_REQUEST);
        }
        
        if (id > ID_CONFIG.MAX_ID) {
            throw new AppError(`ID cannot exceed ${ID_CONFIG.MAX_ID}`, STATUS_CODES.BAD_REQUEST);
        }

        return id;
    } catch (error) {
        console.error(`Error in idUtil.validateID: ${error.message} ${error.status}`);
        throw error;
    }
};

/**
 * Validates UUID format
 * @param {string} uuid - UUID to validate
 * @param {Object} options - Validation options
 * @param {string} options.idType - Type of ID for error messages
 * @returns {string} validated UUID (lowercase)
 * @throws {AppError} if any issue occurs
 */
const validateUUID = (uuid, options = {}) => {
    const { idType = 'UUID' } = options;

    try {
        if (!uuid) {
            throw new AppError(`${idType} is required`, STATUS_CODES.BAD_REQUEST);
        }

        if (typeof uuid !== 'string') {
            throw new AppError(`${idType} must be a string`, STATUS_CODES.BAD_REQUEST);
        }

        const normalizedUUID = uuid.trim().toLowerCase();

        if (!ID_CONFIG.UUID_REGEX.test(normalizedUUID)) {
            throw new AppError(`${idType} must be a valid UUID format`, STATUS_CODES.BAD_REQUEST);
        }

        return normalizedUUID;
    } catch (error) {
        console.error(`Error in idUtil.validateUUID: ${error.message}`);
        throw error;
    }
};

module.exports = {
    validateID,
    validateUUID
};