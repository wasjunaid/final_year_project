const { LogService } = require("../../services/Log/LogService");
const { statusCodes } = require("../../utils/statusCodesUtil");

class LogController {
    async getLogs(req, res) {
        const { person_id } = req.user;

        try {
            const logs = await LogService.getLogs(person_id);

            return res.status(statusCodes.OK).json({
                data: logs,
                message: "Logs retrieved successfully",
                status: statusCodes.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in LogController.getLogs: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER,
                success: false,
            });
        }
    }
}

module.exports = new LogController();