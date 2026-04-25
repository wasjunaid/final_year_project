const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { TokenService } = require("../../services/Token/TokenService");
const { VALID_TOKEN_TYPES_OBJECT } = require("../../utils/tokenUtil");

class TokenController {
    async sendOrResendEmailVerificationToken(req, res) {
        try {
            const { email } = req.body;

            await TokenService.insertOrUpdateToken(email, VALID_TOKEN_TYPES_OBJECT.EMAIL_VERIFICATION);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Email verification token sent successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in TokenController.sendOrResendEmailVerificationToken: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Send Email Verification Token",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async sendOrResendPasswordResetToken(req, res) {
        try {
            const { email } = req.body;

            await TokenService.insertOrUpdateToken(email, VALID_TOKEN_TYPES_OBJECT.PASSWORD_RESET);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Password reset token sent successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in TokenController.sendOrResendPasswordResetToken: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Send Password Reset Token",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async verifyEmailUsingToken(req, res) {
        try {
            const { token } = req.body;

            await TokenService.verifyEmailUsingToken(token);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Email verified successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in TokenController.verifyEmailUsingToken: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Verify Email",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async resetPasswordUsingToken(req, res) {
        try {
            const { token, password, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                throw new AppError("Password and Confirm Password do not match", STATUS_CODES.BAD_REQUEST);
            }

            await TokenService.resetPasswordUsingToken(token, password);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Password reset successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in TokenController.resetPasswordUsingToken: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Unable to Reset Password",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new TokenController();