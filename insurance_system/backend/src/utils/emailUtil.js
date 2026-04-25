const { STATUS_CODES } = require("./statusCodesUtil");
const { AppError } = require("../classes/AppErrorClass");

// Email validation configuration
const EMAIL_CONFIG = {
    MAX_LENGTH: 320,           // RFC 5321 standard
    MAX_LOCAL_LENGTH: 64,      // Local part (before @)
    MAX_DOMAIN_LENGTH: 253,    // Domain part (after @)

    // Allowed special characters in local part (before @)
    ALLOWED_LOCAL_SPECIAL_CHARS: /[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]/,

    // Common disposable email domains (for healthcare security)
    DISPOSABLE_DOMAINS: [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
        'mailinator.com', 'trash-mail.com', 'yopmail.com'
    ]
};

// Comprehensive email regex based on RFC 5322 (simplified but robust)
const EMAIL_REGEX = /^[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

/**
 * Normalize email address (lowercase, trim)
 * @param {string} email - Email address
 * @returns {string} normalized email
 */
const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
};

/**
 * Validates email format and security requirements
 * @param {string} email - Email address to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowDisposable - Allow disposable email domains (default: false)
 * @returns {string} normalized email if valid
 * @throws {AppError} if invalid
 */
const validateEmail = (email, options = {}) => {
    const {
        allowDisposable = false
    } = options;

    try {
        // Basic null/undefined check
        if (!email) {
            throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
        }

        // Type validation
        if (typeof email !== 'string') {
            throw new AppError("email must be a string", STATUS_CODES.BAD_REQUEST);
        }

        // Trim whitespace and lowercase
        email = normalizeEmail(email);

        // Basic format validation
        if (!EMAIL_REGEX.test(email)) {
            throw new AppError("invalid email format", STATUS_CODES.BAD_REQUEST);
        }

        // Split email into local and domain parts
        const emailParts = email.split('@');
        if (emailParts.length !== 2) {
            throw new AppError("email must contain exactly one @ symbol", STATUS_CODES.BAD_REQUEST);
        }

        const [localPart, domainPart] = emailParts;

        // Local part validation (before @)
        if (localPart.length === 0 || localPart.length > EMAIL_CONFIG.MAX_LOCAL_LENGTH) {
            throw new AppError(`email local part must be between 1 and ${EMAIL_CONFIG.MAX_LOCAL_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
        }

        // Domain part validation (after @)
        if (domainPart.length === 0 || domainPart.length > EMAIL_CONFIG.MAX_DOMAIN_LENGTH) {
            throw new AppError(`email domain must be between 1 and ${EMAIL_CONFIG.MAX_DOMAIN_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
        }

        // Disposable email validation
        if (!allowDisposable) {
            const isDisposable = EMAIL_CONFIG.DISPOSABLE_DOMAINS.some(disposableDomain =>
                domainPart.endsWith(disposableDomain.toLowerCase())
            );

            if (isDisposable) {
                throw new AppError("disposable email addresses are not allowed", STATUS_CODES.BAD_REQUEST);
            }
        }

        return email;
    } catch (error) {
        console.error(`Error in emailUtil.validateEmail: ${error.message} ${error.status}`);
        throw error;
    }
};

module.exports = {
    EMAIL_CONFIG,
    validateEmail
};
