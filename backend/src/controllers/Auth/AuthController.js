const { statusCodes } = require("../../utils/statusCodesUtil");
const { AuthService } = require("../../services/Auth/AuthService");

class AuthController {
    async signUp(req, res) {
        try {
            const { email, password, role } = req.body;

            await AuthService.signUp(email, password, role);

            return res.status(statusCodes.OK).json({
                data: null,
                message: 'Sign Up Successful. Please verify your email.',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error signing up: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: 'Unable to Sign Up',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
    
    async signIn(req, res) {
        try {
            const { email, password, role } = req.body;

            const result = await AuthService.signIn(email, password, role);
            
            return res.status(statusCodes.OK).json({
                data: result,
                message: 'Sign In Successful',
                statusCode: statusCodes.OK,
                success: true
            });
        } catch (error) {
            if (error.status === statusCodes.FORBIDDEN) {
                return res.status(error.status || statusCodes.FORBIDDEN).json({
                    data: null,
                    message: error.message || 'Email Verification Needed',
                    status: error.status || statusCodes.FORBIDDEN,
                    success: false,
                    emailVerificationNeeded: true
                });
            }

            console.error(`Error signing in: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: 'Unable to Sign In',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new AuthController();