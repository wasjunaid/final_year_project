const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { JWTService } = require("./JWTService");
const { PersonService } = require("../Person/PersonService");
const { PatientService } = require("../Patient/PatientService");
const { DoctorService } = require("../Doctor/DoctorService");
const { TokenService } = require("../Token/TokenService");
const { LogService } = require("../Log/LogService");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const {
    VALID_TOKEN_TYPES_OBJECT
} = require("../../utils/tokenUtil");
const {
    VALID_SYSTEM_ADMIN_ROLES
} = require("../../validations/system/systemValidations");
const { VALID_HOSPITAL_STAFF_ROLES } = require("../../utils/validConstantsUtil");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { SystemAdminService } = require("../System/SystemAdminService");
const { MedicalCoderService } = require("../MedicalCoder/MedicalCoderService");
const { NotificationService } = require("../Notification/NotificationService");
const { validateFieldsForSignUp, validateFieldsForSignIn } = require("../../validations/auth/authValidations")

class AuthService {
    /**
     * Signs up a new user with the given email, password, and role.
     * @param {Object} params - The user details.
     * @param {string} params.email - The email of the user.
     * @param {string} params.password - The password of the user.
     * @param {string} params.role - The role of the user (patient, doctor, medical_coder).
     * @returns {Promise<boolean>} True if sign-up is successful.
     * @throws {AppError} if any issue occurs
     */
    static async signUp ({ email, password, role }) {
        try {
            if (!email) {
                throw new AppError('Email is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!password) {
                throw new AppError('Password is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError('Role is required', STATUS_CODES.BAD_REQUEST);
            }

            ({ email, role } = validateFieldsForSignUp({ email, password, role }));

            const person = await PersonService.insertPersonIfNotExists(email, password);

            if (role === VALID_ROLES_OBJECT.PATIENT) {
                const patientResult = await PatientService.insertPatientIfNotExists(person.person_id);
                if (!patientResult) {
                    throw new AppError("User with this email already exists as a patient", STATUS_CODES.CONFLICT);
                }
            } else if (role === VALID_ROLES_OBJECT.DOCTOR) {
                const doctorResult = await DoctorService.insertDoctorIfNotExists(person.person_id);
                if (!doctorResult) {
                    throw new AppError("User with this email already exists as a doctor", STATUS_CODES.CONFLICT);
                }
            } else if (role === VALID_ROLES_OBJECT.MEDICAL_CODER) {
                const medicalCoderResult = await MedicalCoderService.insertMedicalCoderIfNotExists(person.person_id);
                if (!medicalCoderResult) {
                    throw new AppError("User with this email already exists as a medical coder", STATUS_CODES.CONFLICT);
                }
            }

            // await TokenService.insertOrUpdateToken(email, VALID_TOKEN_TYPES_OBJECT.EMAIL_VERIFICATION);
            // uncomment above line when testing is over

            await LogService.insertLog(person.person_id, `Sign Up: User with email ${email} signed up as ${role}`);

            return true;
        } catch (error) {
            console.error(`Error in AuthService.signUp: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Signs in a user with the given email, password, and role.
     * @param {Object} params - The user details.
     * @param {string} params.email - The email of the user.
     * @param {string} params.password - The password of the user.
     * @param {string} params.role - The role of the user (patient, doctor, medical_coder, hospital staff, system admin).
     * @returns {Promise<{accessToken: string, refreshToken: string}>} The generated JWT tokens.
     * @throws {AppError} if any issue occurs
     */
    static async signIn({ email, password, role }) {
        try {
            if (!email) {
                throw new AppError("Email is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!password) {
                throw new AppError("Password is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError("Role is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ email, role } = validateFieldsForSignIn({ email, password, role }));

            const person = await PersonService.compareEmailAndPassword(email, password);

            if (person.is_deleted) {
                throw new AppError("User is deleted", STATUS_CODES.UNAUTHORIZED);
            }

            if (role === VALID_ROLES_OBJECT.PATIENT) {
                const patientExists = await PatientService.getPatientIfExists(person.person_id);
                if (!patientExists) {
                    throw new AppError("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
                }
            } else if (role === VALID_ROLES_OBJECT.DOCTOR) {
                const doctorExists = await DoctorService.getDoctorIfExists(person.person_id);
                if (!doctorExists) {
                    throw new AppError("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
                }
            } else if (role === VALID_ROLES_OBJECT.MEDICAL_CODER) {
                const medicalCoderExists = await MedicalCoderService.getMedicalCoderIfExists(person.person_id);
                if (!medicalCoderExists) {
                    throw new AppError("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
                }
            } else if (VALID_HOSPITAL_STAFF_ROLES.includes(role)) {
                const hospitalStaffExists = await HospitalStaffService.getHospitalStaffIfExists(person.person_id);
                if (!hospitalStaffExists) {
                    throw new AppError("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
                }
                if (hospitalStaffExists.role !== role) {
                    throw new AppError("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
                }
            } else if (VALID_SYSTEM_ADMIN_ROLES.includes(role)) {
                const systemAdminExists = await SystemAdminService.getSystemAdminAgainstRoleIfExists(person.person_id, role);
                if (!systemAdminExists) {
                    throw new AppError("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
                }
            }

            if (!person.is_verified) {
                throw new AppError("Verify Email", STATUS_CODES.FORBIDDEN);
            }

            const tokens = await JWTService.generateJWT(person.person_id, role);

            await LogService.insertLog(person.person_id, `Sign In: User with email ${email} signed in as ${role}`);

            await NotificationService.insertNotification({person_id: person.person_id,
                role: role,
                title: "Sign In",
                message: `You have signed in as a ${role}`,
                type: "general",
                related_id: person.person_id,
                related_table: "person",
                email: email,
                sendEmail: true
            });

            return tokens;
        } catch (error) {
            console.error(`Error in AuthService.signIn: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Signs out a user with the given person ID.
     * @param {number|string} person_id - The ID of the person.
     * @returns {Promise<boolean>} True if sign-out is successful.
     * @throws {AppError} if any issue occurs
     */
    static async signOut(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const person = await PersonService.getPersonIfExists(person_id);
            if (!person) {
                throw new AppError("Person does not exist", STATUS_CODES.BAD_REQUEST);
            }

            await LogService.insertLog(person.person_id, `Sign Out: User with email ${person.email} signed out as ${person.role.toLowerCase()}`);

            return true;
        } catch (error) {
            console.error(`Error in AuthService.signOut: ${error.message} ${error.status}`);
            throw error;
        }
    }

    // TODO: REMOVE THIS METHOD - Temporary medical coder signup without email verification
    // This should be moved to admin panel flow
    static async signUpMedicalCoder({ email, password, name }) {
        try {
            if (!email) {
                throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
            }
            email = validateEmail(email);

            if (!password) {
                throw new AppError("password is required", STATUS_CODES.BAD_REQUEST);
            }

            // Try to create or get the person record
            // insertPersonIfNotExists should create the person and return it,
            // or return the existing person; adapt if your PersonService has a different signature.
            const person = await PersonService.insertPersonIfNotExists(email, password, { name });

            // If insertPersonIfNotExists returns null/false when already exists, handle that:
            if (!person) {
                throw new AppError("Email already registered", STATUS_CODES.CONFLICT);
            }

            // Ensure a medical_coder record exists for this person
            const medicalCoderResult = await MedicalCoderService.insertMedicalCoderIfNotExists(person.person_id);
            if (!medicalCoderResult) {
                // If the medical coder record could not be created because it already exists, keep the message consistent
                throw new AppError("User with this email already exists as a medical coder", STATUS_CODES.CONFLICT);
            }

            // Bypass email verification for the temporary flow:
            // If you need the person record to be marked verified, try to update via PersonService (if available).
            // e.g. await PersonService.markVerified(person.person_id);
            // (Don't call database layer directly here; use service methods.)

            // Generate tokens for immediate use (matches signIn behavior)
            const tokens = await JWTService.generateJWT(person.person_id, VALID_ROLES_OBJECT.MEDICAL_CODER);

            // Log the signup
            await LogService.insertLog(person.person_id, `Sign Up (medical coder): User with email ${email} created as medical coder`);

            // Return a response object similar to the previous temp impl so controller can send it back
            return {
                tokens, // may be an object with access/refresh depending on JWTService
                user: {
                    person_id: person.person_id,
                    name: person.name || name || VALID_ROLES_OBJECT.MEDICAL_CODER,
                    email: person.email,
                    role: VALID_ROLES_OBJECT.MEDICAL_CODER
                }
            };
        } catch (error) {
            console.error(`Error in AuthService.signUpMedicalCoder: ${error.message} ${error.status || ""}`);
            throw error;
        }
    }
}

module.exports = { AuthService };