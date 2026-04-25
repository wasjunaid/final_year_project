const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AuthService } = require("../../services/Auth/AuthService");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");

class AuthController {
    async signUp(req, res) {
        try {
            const { email, password, role } = req.body;

            // TODO: REMOVE THIS CONDITIONAL WHEN MEDICAL CODER FLOW IS PROPERLY IMPLEMENTED THROUGH ADMIN PANEL
            // if (role === VALID_ROLES_OBJECT.MEDICAL_CODER) {
            //     return await this.signUpMedicalCoder(req, res);
            // }

            await AuthService.signUp({ email, password, role });

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: 'Sign Up Successful. Please verify your email.',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AuthController.signUp: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: 'Unable to Sign Up',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    // TODO: REMOVE THIS METHOD - Temporary medical coder signup
    // This should be moved to admin panel where admins can create medical coder accounts
    signUpMedicalCoder = async (req, res) => {
        console.log('signUpMedicalCoder controller function called!');
        try {
            const { email, password, name } = req.body;

            if (!email || !password) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    data: null,
                    message: 'Email and password are required',
                    status: STATUS_CODES.BAD_REQUEST,
                    success: false
                });
            }

            // Temporarily bypass email verification for medical coder
            const result = await AuthService.signUpMedicalCoder({ 
                email, 
                password, 
                name: name || VALID_ROLES_OBJECT.MEDICAL_CODER 
            });

            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: 'Medical Coder Sign Up Successful',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AuthController.signUpMedicalCoder: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Sign Up Medical Coder',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
    
    async signIn(req, res) {
        try {
            const { email, password, role } = req.body;

            const result = await AuthService.signIn({ email, password, role });
            
            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: 'Sign In Successful',
                statusCode: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            if (error.status === STATUS_CODES.FORBIDDEN) {
                return res.status(error.status || STATUS_CODES.FORBIDDEN).json({
                    data: null,
                    message: error.message || 'Email Verification Needed',
                    status: error.status || STATUS_CODES.FORBIDDEN,
                    success: false,
                    emailVerificationNeeded: true
                });
            }

            console.error(`Error in AuthController.signIn: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: 'Unable to Sign In',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new AuthController();