const { statusCodes } = require("../../utils/statusCodesUtil");
const { DoctorNoteService } = require("../../services/Doctor/DoctorNoteService");

class DoctorNoteController {
    async getDoctorNoteAgainstAppointment(req, res) {
        const { appointment_id } = req.params;

        try {
            const doctorNote = await DoctorNoteService.getDoctorNoteAgainstAppointment(appointment_id);

            return res.status(statusCodes.OK).json({
                data: doctorNote,
                message: "Doctor Note Retrieved Successfully",
                status: statusCodes.OK,
                success: true,
            });
        } catch (error) {
            console.error(`error getting doctor note: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async insertDoctorNote(req, res) {
        const { appointment_id, note } = req.body;

        try {
            const doctorNote = await DoctorNoteService.insertDoctorNote(appointment_id, note);

            return res.status(statusCodes.CREATED).json({
                data: doctorNote,
                message: "Doctor Note Inserted Successfully",
                status: statusCodes.CREATED,
                success: true,
            });
        } catch (error) {
            console.error(`error inserting doctor note: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }
}

module.exports = new DoctorNoteController();