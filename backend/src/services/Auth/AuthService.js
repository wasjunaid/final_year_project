const { PersonService } = require("../Person/PersonService");
const { PatientService } = require("../Patient/PatientService");
const { DoctorService } = require("../Doctor/DoctorService");
const { JWTService } = require("./JWTService");
const { EmailVerificationTokenService } = require("../Token/EmailVerificationTokenService");
const { LogService } = require("../Log/LogService");
const { NotificationService } = require("../Notification/NotificationService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

const roles = ['patient', 'doctor'];

class AuthService {
    static async signUp (email, password, role) {
        if (!email) {
            throw new AppError("email is required", statusCodes.BAD_REQUEST);
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError("Invalid email format", statusCodes.BAD_REQUEST);
        }
        if (!password) {
            throw new AppError("password is required", statusCodes.BAD_REQUEST);
        }
        if (!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }
        if (!roles.includes(role.toLowerCase())) {
            throw new AppError("Invalid role", statusCodes.BAD_REQUEST);
        }

        try {
            const person = await PersonService.insertPersonIfNotExists(email, password);

            if (role.toLowerCase() === 'patient') {
                const patientResult = await PatientService.insertPatientIfNotExists(person.person_id);
                if (!patientResult) {
                    throw new AppError("User with this email already exists as a patient", statusCodes.CONFLICT);
                }
            } else if (role.toLowerCase() === 'doctor') {
                const doctorResult = await DoctorService.insertDoctorIfNotExists(person.person_id);
                if (!doctorResult) {
                    throw new AppError("User with this email already exists as a doctor", statusCodes.CONFLICT);
                }
            }

            await EmailVerificationTokenService.insertOrUpdateEmailVerificationToken(person.person_id);
        } catch (error) {
            console.error(`Error signing up: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async signIn(email, password, role) {
        if (!email) {
            throw new AppError("email is required", statusCodes.BAD_REQUEST);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError("Invalid Credentials", statusCodes.UNAUTHORIZED);
        }
        if (!password) {
            throw new AppError("password is required", statusCodes.BAD_REQUEST);
        }
        if (!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }
        if (!roles.includes(role.toLowerCase())) {
            throw new AppError("Invalid Credentials", statusCodes.UNAUTHORIZED);
        }

        try {
            const person_id = await PersonService.verifyEmailAndPassword(email, password);

            const person = await PersonService.getPerson(person_id);

            if (role.toLowerCase() === 'patient') {
                const patientExists = await PatientService.checkPatientExists(person_id);
                if (!patientExists) {
                    throw new AppError("Invalid Credentials", statusCodes.UNAUTHORIZED);
                }
            } else if (role.toLowerCase() === 'doctor') {
                const doctorExists = await DoctorService.checkDoctorExists(person_id);
                if (!doctorExists) {
                    throw new AppError("Invalid Credentials", statusCodes.UNAUTHORIZED);
                }
            }

            if (!person.is_verified) {
                throw new AppError("Verify Email", statusCodes.FORBIDDEN);
            }

            const tokens = await JWTService.generateJWT(person_id, role.toLowerCase());

            await LogService.insertLog(person.person_id, `Sign In: User with email ${email} signed in as ${role.toLowerCase()}`);

            await NotificationService.insertNotification(person.person_id, {
                role: role,
                title: "Sign In",
                message: `You have signed in as a ${role.toLowerCase()}`,
                type: "check",
                related_id: person.person_id,
                related_type: "person",
                email: email,
                sendEmail: true
            });

            return tokens;
        } catch (error) {
            console.error(`Error signing in: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async signOut(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {

        } catch (error) {
            console.error(`Error signing out: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { AuthService };