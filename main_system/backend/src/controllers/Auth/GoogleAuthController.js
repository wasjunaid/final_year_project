const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { FRONTEND_URL } = require("../../config/frontendConfig");
const { passport } = require('../../services/Auth/GoogleAuthService');

class GoogleAuthController {
    async googleAuth(req, res, next) {
        const state = req.query.state;
        passport.authenticate('google', { 
            scope: ['profile', 'email'],
            state: state
        })(req, res, next);
    }

    async googleAuthCallback(req, res, next) {
        if (req.query.state) {
            try {
                const stateData = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
                req.roleFromState = stateData.role;
            } catch (error) {
                console.error(`Error in GoogleAuthController.googleAuthCallback: ${error.message} ${error.status}`);
            }
        }

        next();
    }

    async googleAuthSuccess(req, res) {
        const { tokens } = req.user;
        
        res.redirect(`${FRONTEND_URL}/auth/google/success`
            + `?accessToken=${tokens.accessToken}`
            + `&refreshToken=${tokens.refreshToken}`
        );
    }
}

module.exports = new GoogleAuthController();