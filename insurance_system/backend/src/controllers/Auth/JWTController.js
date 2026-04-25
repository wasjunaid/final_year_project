const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { JWTService } = require("../../services/Auth/JWTService");

class JWTController {
    async refreshJWT(req, res) {
        try {
            const { refreshToken } = req.body;

            const newTokens = await JWTService.refreshJWT(refreshToken);
            
            return res.status(STATUS_CODES.OK).json({
                data: newTokens,
                message: 'JWT Refreshed Successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in JWTController.refreshJWT: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Refresh JWT',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new JWTController();