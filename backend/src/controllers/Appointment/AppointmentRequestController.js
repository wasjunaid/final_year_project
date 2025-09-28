const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppointmentRequestService } = require("../../services/Appointment/AppointmentRequestService");

class AppointmentRequestController {
    async getAppointmentRequestsForPatient(req, res) {
        const { person_id } = req.user;

        try {
            const appointmentRequests = await AppointmentRequestService.getAppointmentRequestsForPatient(person_id);

            res.status(statusCodes.OK).json({ 
                data: appointmentRequests,
                message: "Appointment requests fetched successfully",
                status: statusCodes.OK,
                success: true    
            });
        } catch (error) {
            console.error(`Error in getAppointmentRequestsForPatient: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching appointment requests",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async getAppointmentRequestsForHospital(req, res) {
        const { person_id } = req.user;

        try {
            const appointmentRequests = await AppointmentRequestService.getAppointmentRequestsForHospital(person_id);

            res.status(statusCodes.OK).json({ 
                data: appointmentRequests,
                message: "Appointment requests fetched successfully",
                status: statusCodes.OK,
                success: true    
            });
        } catch (error) {
            console.error(`Error in getAppointmentRequestsForHospital: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching appointment requests",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async insertAppointmentRequest(req, res) {
        const { person_id } = req.user;
        const { hospital_id, date, time, reason } = req.body;

        try {
            const newRequest = await AppointmentRequestService.insertAppointmentRequest(person_id, {
                hospital_id,
                date,
                time,
                reason
            });

            res.status(statusCodes.CREATED).json({
                data: newRequest,
                message: "Appointment request created successfully",
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in insertAppointmentRequest: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error creating appointment request",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async updateAppointmentRequestStatusForHospital(req, res) {
        const { person_id } = req.user;
        const { appointment_request_id } = req.params;
        const { doctor_id, date, time, status } = req.body;

        try {
            const updatedRequest = await AppointmentRequestService.updateAppointmentRequestStatusForHospital(person_id, {
                appointment_request_id,
                doctor_id,
                date,
                time,
                status
            });

            res.status(statusCodes.OK).json({
                data: updatedRequest,
                message: "Appointment request updated successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in updateAppointmentRequestStatusForHospital: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error updating appointment request",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async cancelAppointmentRequest(req, res) {
        const { person_id } = req.user;
        const { appointment_request_id } = req.params;

        try {
            const cancelledRequest = await AppointmentRequestService.cancelAppointmentRequest(person_id, appointment_request_id);

            res.status(statusCodes.OK).json({
                data: cancelledRequest,
                message: "Appointment request canceled successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in cancelAppointmentRequest: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error canceling appointment request",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async rescheduleAppointmentRequest(req, res) {
        const { person_id } = req.user;
        const { appointment_request_id } = req.params;
        const { date, time, reason } = req.body;

        try {
            const rescheduledRequest = await AppointmentRequestService.rescheduleAppointmentRequest(person_id, {
                appointment_request_id,
                date,
                time,
                reason
            });

            res.status(statusCodes.OK).json({
                data: rescheduledRequest,
                message: "Appointment request rescheduled successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in rescheduleAppointmentRequest: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error rescheduling appointment request",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }
}

module.exports = new AppointmentRequestController();