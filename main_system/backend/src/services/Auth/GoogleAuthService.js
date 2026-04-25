const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { googleStrategyConfig } = require('../../config/googleStrategyConfig');
const { JWTService } = require("./JWTService");
const { PersonService } = require("../Person/PersonService");
const { PatientService } = require("../Patient/PatientService");
const { DoctorService } = require("../Doctor/DoctorService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const { VALID_SYSTEM_ADMIN_ROLES } = require("../../validations/system/systemValidations");
const {VALID_HOSPITAL_STAFF_ROLES } = require("../../utils/validConstantsUtil");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { SystemAdminService } = require("../System/SystemAdminService");
const { MedicalCoderService } = require("../MedicalCoder/MedicalCoderService");
const { LogService } = require("../Log/LogService");

passport.use(
    new GoogleStrategy(googleStrategyConfig,
        async function(req, accessToken, refreshToken, profile, done) {
            let requestedRole = 'patient'; // Default role
            try {
                if (req.query.state) {
                    try {
                        const decodedString = Buffer.from(req.query.state, 'base64').toString();
                        const stateData = JSON.parse(decodedString);
                        requestedRole = stateData.role || 'patient';
                    } catch (error) {
                        console.error(`Error in GoogleAuthService: ${error.message} ${error.status}`);
                        throw new AppError('Invalid state parameter', STATUS_CODES.BAD_REQUEST);
                    }
                }
                
                requestedRole = requestedRole.trim().toLowerCase();

                const email = profile.emails[0].value;
            
                const person = await PersonService.insertPersonIfNotExists(email, null, { 
                    first_name: profile.name.givenName,
                    last_name: profile.name.familyName,
                    is_email_verified: true
                });

                if (person.is_deleted) {
                    throw new AppError("User is deleted", STATUS_CODES.UNAUTHORIZED);
                }

                if (requestedRole === VALID_ROLES_OBJECT.PATIENT) {
                    await PatientService.insertPatientIfNotExists(person.person_id);
                } else if (requestedRole === VALID_ROLES_OBJECT.DOCTOR) {
                    await DoctorService.insertDoctorIfNotExists(person.person_id);
                } else if (requestedRole === VALID_ROLES_OBJECT.MEDICAL_CODER) {
                    await MedicalCoderService.insertMedicalCoderIfNotExists(person.person_id);
                } else if (VALID_HOSPITAL_STAFF_ROLES.HOSPITAL_STAFF.includes(requestedRole)) {
                    const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person.person_id);
                    if (!hospitalStaff) {
                        throw new AppError("User with this email does not exist as hospital staff", STATUS_CODES.UNAUTHORIZED);
                    }
                    if (hospitalStaff.role !== requestedRole) {
                        throw new AppError(`User does not have the required role: ${requestedRole}`, STATUS_CODES.FORBIDDEN);
                    }
                } else if (VALID_SYSTEM_ADMIN_ROLES.SYSTEM_ADMIN.includes(requestedRole)) {
                    const systemAdmin = await SystemAdminService.getSystemAdminAgainstRoleIfExists(person.person_id, requestedRole);
                    if (!systemAdmin) {
                        throw new AppError("User with this email does not exist as system admin", STATUS_CODES.UNAUTHORIZED);
                    }
                }

                const tokens = await JWTService.generateJWT(person.person_id, requestedRole);

                await LogService.insertLog(person.person_id, `Sign In: User with email ${person.email} signed in as ${requestedRole}`);

                return done(null, { tokens });
            } catch (error) {
                console.error(`Error in GoogleAuthService: ${error.message} ${error.status}`);
                return done(error);
            }
        }
    )
);

module.exports = { passport };