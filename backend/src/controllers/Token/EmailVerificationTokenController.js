const { statusCodes } = require("../../utils/statusCodesUtil");
const { EmailVerificationTokenService } = require("../../services/Token/EmailVerificationTokenService");
const { PersonService } = require("../../services/Person/PersonService");

class EmailVerificationTokenController {
    async sendOrResendEmailVerificationToken(req, res) {
        const { email } = req.body;

        try {
            const person = await PersonService.getPersonByEmail(email);

            await EmailVerificationTokenService.insertOrUpdateEmailVerificationToken(person.person_id);

            return res.status(statusCodes.OK).json({
                data: null,
                message: "Email verification token sent successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error sending email verification token: ${error}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Send Email Verification Token",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async verifyEmail(req, res) {
        const { token } = req.body;

        try {
            const result = await EmailVerificationTokenService.verifyEmail(token);
            
            if (!result) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    data: null,
                    message: "Email verification failed",
                    status: statusCodes.BAD_REQUEST,
                    success: false
                });
            }

            return res.status(statusCodes.OK).json({
                data: null,
                message: "Email verified successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error verifying email: ${error}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Verify Email",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new EmailVerificationTokenController();