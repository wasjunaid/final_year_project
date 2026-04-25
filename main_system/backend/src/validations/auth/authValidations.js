const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { validateEmail } = require("../../utils/emailUtil");

const AUTH_CONFIG = {
    ROLE_MAX_LENGTH: 30
};

const VALID_ROLES_OBJECT = {
    PERSON: 'person',
    SUPER_ADMIN: 'super admin',
    ADMIN: 'admin',
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    MEDICAL_CODER: 'medical coder',
    HOSPITAL_ADMIN: 'hospital admin',
    HOSPITAL_SUB_ADMIN: 'hospital sub admin',
    HOSPITAL_FRONT_DESK: 'hospital front desk',
    HOSPITAL_LAB_TECHNICIAN: 'hospital lab technician',
    HOSPITAL_PHARMACIST: 'hospital pharmacist'
};

const VALID_ROLES = Object.values(VALID_ROLES_OBJECT);

const VALID_ROLES_FOR_SIGN_IN = [
    VALID_ROLES_OBJECT.SUPER_ADMIN,
    VALID_ROLES_OBJECT.ADMIN,
    VALID_ROLES_OBJECT.PATIENT,
    VALID_ROLES_OBJECT.DOCTOR,
    VALID_ROLES_OBJECT.MEDICAL_CODER,
    VALID_ROLES_OBJECT.HOSPITAL_ADMIN,
    VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN,
    VALID_ROLES_OBJECT.HOSPITAL_FRONT_DESK,
    VALID_ROLES_OBJECT.HOSPITAL_LAB_TECHNICIAN,
    VALID_ROLES_OBJECT.HOSPITAL_PHARMACIST
];

const VALID_ROLES_FOR_SIGN_UP = [
    VALID_ROLES_OBJECT.PATIENT,
    VALID_ROLES_OBJECT.DOCTOR,
    VALID_ROLES_OBJECT.MEDICAL_CODER
];

const ROLE_ALIASES = {
    'sub admin': VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN,
    'subadmin': VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN,
    'sub-admin': VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN,
    'hospital sub-admin': VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN,
    'hospital_sub_admin': VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN,
    'hospital subadmin': VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN,
    'hospital sub admin': VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN,
    'front desk': VALID_ROLES_OBJECT.HOSPITAL_FRONT_DESK,
    'lab technician': VALID_ROLES_OBJECT.HOSPITAL_LAB_TECHNICIAN,
};

const normalizeRoleAlias = (role) => {
    const normalized = String(role)
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ');

    return ROLE_ALIASES[normalized] || normalized;
};

/**
 * Validates common fields for authentication (sign up/sign in).
 * @param {Object} params parameters object
 * @param {string} params.email email of the user
 * @param {string} params.password password of the user
 * @param {string} params.role role of the user
 * @returns {Object} normalized fields (email and role)
 * @throws {AppError} if any validation fails
 */
const validateFieldsForAuth = ({ email, password, role }) => {
    if (!email) {
        throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
    }

    try {
        email = validateEmail(email);
    } catch (error) {
        throw error;
    }

    if (!password) {
        throw new AppError("password is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof password !== 'string') {
        throw new AppError("password must be a string", STATUS_CODES.BAD_REQUEST);
    }

    if (!role) {
        throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof role !== 'string') {
        throw new AppError("role must be a string", STATUS_CODES.BAD_REQUEST);
    }

    role = normalizeRoleAlias(role);

    if (role.length === 0) {
        throw new AppError("role cannot be an empty string", STATUS_CODES.BAD_REQUEST);
    }

    if (role.length > AUTH_CONFIG.ROLE_MAX_LENGTH) {
        throw new AppError(`role must be at most ${AUTH_CONFIG.ROLE_MAX_LENGTH} characters long`, STATUS_CODES.BAD_REQUEST);
    }

    return { email, role };
};

/**
 * Validates fields for user sign up.
 * @param {Object} params parameters object
 * @param {string} params.email email of the user
 * @param {string} params.password password of the user
 * @param {string} params.role role of the user
 * @returns {Object} normalized fields (email and role)
 * @throws {AppError} if any validation fails
 */
const validateFieldsForSignUp = ({ email, password, role }) => {
    try {
        ({ email, role } = validateFieldsForAuth({ email, password, role }));
    } catch (error) {
        throw error;
    }

    if (!VALID_ROLES_FOR_SIGN_UP.includes(role)) {
        throw new AppError(`invalid role ${role} provided, must be one of: ${VALID_ROLES_FOR_SIGN_UP.join(", ")}`, STATUS_CODES.BAD_REQUEST);
    }

    return { email, role };
};

/**
 * Validates fields for user sign in.
 * @param {Object} params parameters object
 * @param {string} params.email email of the user
 * @param {string} params.password password of the user
 * @param {string} params.role role of the user
 * @returns {Object} normalized fields (email and role)
 * @throws {AppError} if any validation fails
 */
const validateFieldsForSignIn = ({ email, password, role }) => {
    try {
        ({ email, role } = validateFieldsForAuth({ email, password, role }));
    } catch (error) {
        throw error;
    }

    if (!VALID_ROLES_FOR_SIGN_IN.includes(role)) {
        throw new AppError(`invalid role ${role} provided, must be one of: ${VALID_ROLES_FOR_SIGN_IN.join(", ")}`, STATUS_CODES.BAD_REQUEST);
    }

    return { email, role };
};

module.exports = {
    AUTH_CONFIG,
    VALID_ROLES_OBJECT,
    VALID_ROLES,
    VALID_ROLES_FOR_SIGN_IN,
    VALID_ROLES_FOR_SIGN_UP,
    validateFieldsForSignUp,
    validateFieldsForSignIn
};