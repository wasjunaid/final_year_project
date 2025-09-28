const { statusCodes } = require("../../utils/statusCodesUtil");
const { JWTService } = require("../../services/Auth/JWTService");

class JWTController {
    async generateJWT(req, res) {
        try {
            const { person_id, role } = req.body;

            const tokens = await JWTService.generateJWT(person_id, role);

            return res.status(statusCodes.OK).json({
                data: tokens,
                message: 'JWT Generated Successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error generating JWT: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: 'Unable to Generate JWT',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async refreshJWT(req, res) {
        try {
            const { refreshToken } = req.body;

            const newTokens = await JWTService.refreshJWT(refreshToken);
            
            return res.status(statusCodes.OK).json({
                data: newTokens,
                message: 'JWT Refreshed Successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error refreshing JWT: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: 'Unable to Refresh JWT',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new JWTController();