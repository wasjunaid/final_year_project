const { statusCodes } = require("../../utils/statusCodesUtil");
const { EHRService } = require("../../services/EHR/EHRService");

class EHRController {
    async getEHRAgainstAppointment(req, res) {
        const { appointment_id } = req.body;

        try {
            const ehrData = await EHRService.getEHRAgainstAppointment(appointment_id);

            return res.status(statusCodes.OK).json({
                data: ehrData,
                message: "EHR retrieved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRController.getEHRAgainstAppointment: ${error.message} ${error.status}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getEHRForDoctor(req, res) {
        const { person_id } = req.user;
        const { patient_id } = req.body;

        try {
            const ehrData = await EHRService.getEHRForDoctor(patient_id, person_id);

            return res.status(statusCodes.OK).json({
                data: ehrData,
                message: "EHR retrieved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRController.getEHRForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new EHRController();