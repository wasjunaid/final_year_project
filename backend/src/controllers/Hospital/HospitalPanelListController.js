const { statusCodes } = require("../../utils/statusCodesUtil");
const { HospitalPanelListService } = require("../../services/Hospital/HospitalPanelListService");

class HospitalPanelListController {
    async getHospitalPanelList(req, res) {
        const { person_id } = req.user;

        try {
            const hospitalPanelList = await HospitalPanelListService.getHospitalPanelList(person_id);

            return res.status(statusCodes.OK).json({
                data: hospitalPanelList,
                message: "Hospital panel list retrieved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getHospitalPanelList controller: ${error.message} ${error.status}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertHospitalPanelList(req, res) {
        const { person_id } = req.user;
        const { insurance_company_id } = req.body;

        try {
            const newHospitalPanel = await HospitalPanelListService.insertHospitalPanelList(person_id, insurance_company_id);

            return res.status(statusCodes.CREATED).json({
                data: newHospitalPanel,
                message: "Hospital panel added successfully",
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in insertHospitalPanelList controller: ${error.message} ${error.status}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteHospitalPanelList(req, res) {
        const { person_id } = req.user;
        const { hospital_panel_list_id } = req.params;

        try {
            await HospitalPanelListService.deleteHospitalPanelList(person_id, hospital_panel_list_id);

            return res.status(statusCodes.OK).json({
                data: null,
                message: "Hospital panel deleted successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in deleteHospitalPanelList controller: ${error.message} ${error.status}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new HospitalPanelListController();