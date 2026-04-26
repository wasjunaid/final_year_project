const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { HospitalPanelListService } = require("../../services/Hospital/HospitalPanelListService");
const { validateID } = require("../../utils/idUtil");

class HospitalPanelListController {
    async getHospitalPanelListIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const hospitalPanelList = await HospitalPanelListService.getHospitalPanelListIfExists(person_id);
            if (!hospitalPanelList) {
                // throw new AppError("No hospital panel list found", STATUS_CODES.NOT_FOUND);
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: "No hospital panel list found",
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: hospitalPanelList,
                message: "Hospital panel list retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalPanelListController.getHospitalPanelListIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertHospitalPanelList(req, res) {
        try {
            const { person_id } = req.user;
            const { insurance_company_id } = req.body;

            const validatedInsuranceCompanyID = validateID(insurance_company_id);

            const newHospitalPanel = await HospitalPanelListService.insertHospitalPanelList(person_id, validatedInsuranceCompanyID);

            return res.status(STATUS_CODES.CREATED).json({
                data: newHospitalPanel,
                message: "Hospital panel added successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalPanelListController.insertHospitalPanelList: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteHospitalPanelList(req, res) {
        try {
            const { person_id } = req.user;
            const { hospital_panel_list_id } = req.params;

            const validatedHospitalPanelListID = validateID(hospital_panel_list_id);

            await HospitalPanelListService.deleteHospitalPanelList(person_id, validatedHospitalPanelListID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Hospital panel deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalPanelListController.deleteHospitalPanelList: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new HospitalPanelListController();