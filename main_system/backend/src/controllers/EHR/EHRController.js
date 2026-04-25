const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { EHRService } = require("../../services/EHR/EHRService");
const { validateID } = require("../../utils/idUtil");

class EHRController {
    async getEHRAgainstAppointment(req, res) {
        try {
            const { person_id } = req.user;
            const { patient_id, appointment_id } = req.body;

            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPatientID = validateID(patient_id);

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedAppointmentID = validateID(appointment_id);

            const ehrData = await EHRService.getEHRAgainstAppointment({
                doctor_id: person_id,
                patient_id: validatedPatientID,
                appointment_id: validatedAppointmentID
            });

            return res.status(STATUS_CODES.OK).json({
                data: ehrData,
                message: "EHR retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRController.getEHRAgainstAppointment: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getEHRForDoctor(req, res) {
        try {
            const { person_id } = req.user;
            const { patient_id } = req.body;

            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPatientID = validateID(patient_id);

            const ehrData = await EHRService.getEHRForDoctor(person_id, validatedPatientID);

            return res.status(STATUS_CODES.OK).json({
                data: ehrData,
                message: "EHR retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRController.getEHRForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new EHRController();