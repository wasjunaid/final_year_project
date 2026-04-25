const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { LogService } = require("../../services/Log/LogService");

class LogController {
    async getLogsIfExists(req, res) {
        try {
            const { person_id, role } = req.user;

            const {
                search = "",
                user_id,
                date_from,
                date_to,
                page,
                limit,
            } = req.query;

            const safePage = Number.isInteger(Number(page)) ? Number(page) : 1;
            const safeLimit = Number.isInteger(Number(limit)) ? Number(limit) : 50;

            const logQueryOptions = {
                search,
                userId: user_id,
                dateFrom: date_from,
                dateTo: date_to,
                page: safePage,
                limit: safeLimit,
            };

            let logs = await LogService.getLogsIfExists(person_id, role, logQueryOptions);
            if (!logs) {
                logs = { rows: [], pagination: null };
            }

            return res.status(STATUS_CODES.OK).json({
                data: logs.rows,
                pagination: logs.pagination,
                // message: "Logs retrieved successfully",
                message: logs.rows.length > 0 ? "Logs retrieved successfully" : "No logs found",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in LogController.getLogsIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER,
                success: false,
            });
        }
    }
}

module.exports = new LogController();