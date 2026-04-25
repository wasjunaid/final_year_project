const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { DashboardStatsService } = require("../../services/System/DashboardStatsService");

class DashboardStatsController {
    async getSummary(req, res) {
        try {
            const { person_id, role } = req.user;
            const summary = await DashboardStatsService.getSummaryForUser(person_id, role);

            return res.status(STATUS_CODES.OK).json({
                data: summary,
                message: "Dashboard stats retrieved successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in DashboardStatsController.getSummary: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error retrieving dashboard stats",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }
}

module.exports = new DashboardStatsController();
