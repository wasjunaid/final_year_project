const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { InsurancePanelListService } = require("../../services/Insurance/InsurancePanelListService");
const { validateID } = require("../../utils/idUtil");

class InsurancePanelListController {
    async getInsurancePanelListIfExists(req, res) {
        try {
            const { user_id } = req.user;

            const panels = await InsurancePanelListService.getInsurancePanelListIfExists(user_id);
            if (!panels) {
                // throw new AppError("No insurance panels found", STATUS_CODES.NOT_FOUND);
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: "No insurance panels found",
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: panels,
                message: "Insurance panel list fetched successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsurancePanelListController.getInsurancePanelList: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertInsurancePanelList(req, res) {
        try {
            const { user_id } = req.user;
            const { hospital_id } = req.body;

            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalID = validateID(hospital_id);

            const panel = await InsurancePanelListService.insertInsurancePanelList(user_id, validatedHospitalID);

            return res.status(STATUS_CODES.CREATED).json({
                data: panel,
                message: "Insurance panel created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsurancePanelListController.insertInsurancePanelList: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteInsurancePanelList(req, res) {
        try {
            const { user_id } = req.user;
            const { insurance_panel_list_id } = req.params;

            if (!insurance_panel_list_id) {
                throw new AppError("insurance_panel_list_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPanelListID = validateID(insurance_panel_list_id);

            await InsurancePanelListService.deleteInsurancePanelList(user_id, validatedPanelListID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Insurance panel deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsurancePanelListController.deleteInsurancePanelList: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new InsurancePanelListController();