const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { googleStrategyConfig } = require('../../config/googleStrategyConfig');
const { JWTService } = require("./JWTService");
const { EmailService } = require("../Email/EmailService");
const { PersonService } = require("../Person/PersonService");
const { PatientService } = require("../Patient/PatientService");
const { DoctorService } = require("../Doctor/DoctorService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

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
                }

                const tokens = await JWTService.generateJWT(person.person_id, requestedRole);

                return done(null, { tokens });
            } catch (error) {
                console.error(`Error during Google authentication: ${error.message}`);
                return done(error);
            }
        }
    )
);

module.exports = { passport };