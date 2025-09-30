const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { googleStrategyConfig } = require('../../config/googleStrategyConfig');
const { JWTService } = require("./JWTService");
const { PersonService } = require("../Person/PersonService");
const { PatientService } = require("../Patient/PatientService");
const { DoctorService } = require("../Doctor/DoctorService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");
const { validHospitalStaffRoles } = require("../../database/hospital/hospitalStaffTableQuery");
const { validSystemAdminRoles } = require("../../database/system/systemAdminTableQuery");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { SystemAdminService } = require("../System/systemAdminService");

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
                        console.error(`Error parsing state: ${error.message}`);
                        throw new AppError('Invalid state parameter', statusCodes.BAD_REQUEST);
                    }
                }
                
                const email = profile.emails[0].value;
            
                const person = await PersonService.insertPersonForGoogleAuth(email, randomPassword, profile.name.givenName, profile.name.familyName);

                if (requestedRole === 'patient') {
                    await PatientService.insertPatientIfNotExists(person.person_id);
                } else if (requestedRole === 'doctor') {
                    await DoctorService.insertDoctorIfNotExists(person.person_id);
                } else if (validHospitalStaffRoles.includes(requestedRole.toLowerCase())) {
                    const hospitalStaff = await HospitalStaffService.checkHospitalStaffExists(person.person_id);
                    if (!hospitalStaff) {
                        throw new AppError("User with this email does not exist as hospital staff", statusCodes.UNAUTHORIZED);
                    }
                    if (hospitalStaff.role !== requestedRole.toLowerCase()) {
                        throw new AppError(`User does not have the required role: ${requestedRole}`, statusCodes.FORBIDDEN);
                    }
                } else if (validSystemAdminRoles.includes(requestedRole.toLowerCase())) {
                    const systemAdmin = await SystemAdminService.checkSystemAdminExistsAgainstRole(person.person_id, requestedRole.toLowerCase());
                    if (!systemAdmin) {
                        throw new AppError("User with this email does not exist as system admin", statusCodes.UNAUTHORIZED);
                    }
                }

                const tokens = await JWTService.generateJWT(person.person_id, requestedRole);

                await LogService.insertLog(person.person_id, `Sign In: User with email ${person.email} signed in as ${requestedRole}`);

                return done(null, { tokens });
            } catch (error) {
                console.error(`Error in google auth: ${error.message} ${error.status}`);
                return done(error);
            }
        }
    )
);

module.exports = { passport };