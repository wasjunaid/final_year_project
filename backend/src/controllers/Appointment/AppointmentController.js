const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppointmentService } = require("../../services/Appointment/AppointmentService");

class AppointmentController {
    async getAppointmentDetails(req, res) {
        const { appointment_id } = req.params;

        try {
            const appointmentDetails = await AppointmentService.getAppointmentDetails(appointment_id);

            res.status(statusCodes.OK).json({
                data: appointmentDetails,
                message: "Appointment details fetched successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getAppointmentDetails: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "error fetching appointment details",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAppointmentsForPatient(req, res) {
        const { person_id } = req.user;

        try {
            const appointments = await AppointmentService.getAppointmentsForPatient(person_id);

            res.status(statusCodes.OK).json({
                data: appointments,
                message: "Appointments fetched successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getAppointmentsForPatient: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "error fetching appointments",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAppointmentsForDoctor(req, res) {
        const { person_id } = req.user;

        try {
            const appointments = await AppointmentService.getAppointmentsForDoctor(person_id);

            res.status(statusCodes.OK).json({
                data: appointments,
                message: "Appointments fetched successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getAppointmentsForDoctor: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "error fetching appointments",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAppointmentsForHospital(req, res) {
        const { person_id } = req.user;

        try {
            const appointments = await AppointmentService.getAppointmentsForHospital(person_id);

            res.status(statusCodes.OK).json({
                data: appointments,
                message: "Appointments fetched successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getAppointmentsForHospital: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "error fetching appointments",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateAppointmentStatus(req, res) {
        const { person_id } = req.user;
        const { appointment_id } = req.params;
        const { status } = req.body;

        try {
            const updatedAppointment = await AppointmentService.updateAppointmentStatus(person_id, appointment_id, status);

            res.status(statusCodes.OK).json({
                data: updatedAppointment,
                message: "Appointment status updated successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in updateAppointmentStatus: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "error updating appointment status",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new AppointmentController();