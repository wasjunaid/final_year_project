const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { AppointmentICDService } = require("../../services/MedicalCoding/AppointmentICDService");

class AppointmentICDController {
    async getAppointmentICDCodesIfExists(req, res) {
        try {
            const { appointment_id } = req.params;

            const icdCodes = await AppointmentICDService.getAppointmentICDCodesIfExists(appointment_id);
            if (!icdCodes) {
                throw new AppError("No ICD codes found for the appointment", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({ 
                data: icdCodes,
                message: "ICD codes for appointment retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentICDController.getAppointmentICDCodesIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertAppointmentICDCode(req, res) {
        try {
            const { appointment_id } = req.params;
            const { icd_code, icd_description } = req.body;

            const newICDCode = await AppointmentICDService.insertAppointmentICDCode(appointment_id, icd_code, icd_description);

            return res.status(STATUS_CODES.CREATED).json({ 
                data: newICDCode,
                message: "ICD code for appointment inserted successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentICDController.insertAppointmentICDCode: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new AppointmentICDController();