const { statusCodes } = require("../../utils/statusCodesUtil");
const { PasswordResetTokenService } = require("../../services/Token/PasswordResetTokenService");
const { PersonService } = require("../../services/Person/PersonService");

class PasswordResetTokenController {
    async sendOrResendPasswordResetToken(req, res) {
        const { email } = req.body;

        try {
            const person = await PersonService.getPersonByEmail(email);

            await PasswordResetTokenService.insertOrUpdatePasswordResetToken(person.person_id);

            return res.status(statusCodes.OK).json({
                data: null,
                message: "Password reset token sent successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error sending password reset token: ${error}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Send Password Reset Token",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async resetPassword(req, res) {
        const { token, password } = req.body;

        try {
            const result = await PasswordResetTokenService.resetPassword(token, password);
            if (!result) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    data: null,
                    message: "Password reset failed",
                    status: statusCodes.BAD_REQUEST,
                    success: false
                });
            }

            return res.status(statusCodes.OK).json({
                data: null,
                message: "Password reset successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error resetting password: ${error}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Reset Password",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PasswordResetTokenController();