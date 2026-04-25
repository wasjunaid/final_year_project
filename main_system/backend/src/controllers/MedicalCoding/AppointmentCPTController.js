const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { AppointmentCPTService } = require("../../services/MedicalCoding/AppointmentCPTService");

class AppointmentCPTController {
    async getAppointmentCPTCodesIfExists(req, res) {
        try {
            const { appointment_id } = req.params;

            const cptCodes = await AppointmentCPTService.getAppointmentCPTCodesIfExists(appointment_id);
            if (!cptCodes) {
                throw new AppError("No CPT codes found for the appointment", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({ 
                data: cptCodes,
                message: "CPT codes for appointment retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentCPTController.getAppointmentCPTCodesIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertAppointmentCPTCode(req, res) {
        try {
            const { appointment_id } = req.params;
            const { cpt_code, cpt_description } = req.body;

            const newCPTCode = await AppointmentCPTService.insertAppointmentCPTCode(appointment_id, cpt_code, cpt_description);

            return res.status(STATUS_CODES.CREATED).json({ 
                data: newCPTCode,
                message: "CPT code for appointment inserted successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentCPTController.insertAppointmentCPTCode: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new AppointmentCPTController();