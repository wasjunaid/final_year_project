const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { AuthService } = require("../../services/Auth/AuthService");
const { VALID_ROLES_FOR_SIGN_IN } = require("../../utils/validConstantsUtil");
const { validateEmail } = require("../../utils/emailUtil");

class AuthController {  
    async signIn(req, res) {
        try {
            const { email, password, role } = req.body;

            if (!email) {
                throw new AppError('Email is required', STATUS_CODES.BAD_REQUEST);
            }

            const validatedEmail = validateEmail(email);

            if (!password) {
                throw new AppError('Password is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError('Role is required', STATUS_CODES.BAD_REQUEST);
            }

            const normalizedRole = role.trim().toLowerCase();

            if (!VALID_ROLES_FOR_SIGN_IN.includes(normalizedRole)) {
                throw new AppError('Invalid role', STATUS_CODES.BAD_REQUEST);
            }

            const result = await AuthService.signIn({ email: validatedEmail, password, role: normalizedRole });
            
            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: 'Sign In Successful',
                statusCode: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AuthController.signIn: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Sign In',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new AuthController();