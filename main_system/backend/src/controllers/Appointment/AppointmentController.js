const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { AppointmentService } = require("../../services/Appointment/AppointmentService");

class AppointmentController {
    async getAppointmentsForPatientIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const appointments = await AppointmentService.getAppointmentsForPatientIfExistsForFrontend(person_id);
            if (!appointments) {
                throw new AppError("No appointments found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: appointments,
                message: "Appointments retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.getAppointmentsForPatientIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAppointmentsForDoctorIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const appointments = await AppointmentService.getAppointmentsForDoctorIfExistsForFrontend(person_id);
            if (!appointments) {
                throw new AppError("No appointments found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: appointments,
                message: "Appointments retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.getAppointmentsForDoctorIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAppointmentsForHospitalStaffIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const appointments = await AppointmentService.getAppointmentsForHospitalStaffIfExistsForFrontend(person_id);
            if (!appointments) {
                throw new AppError("No appointments found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: appointments,
                message: "Appointments retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.getAppointmentsForHospitalStaffIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertAppointment(req, res) {
        try {
            const { person_id } = req.user;
            const {
                doctor_id,
                hospital_id,
                date,
                time,
                reason,
                appointment_type,
                parent_appointment_id,
                follow_up_notes,
                admission_date,
                discharge_date,
            } = req.body;

            const appointment = await AppointmentService.insertAppointment({
                patient_id: person_id,
                doctor_id,
                hospital_id,
                date,
                time,
                reason,
                appointment_type,
                parent_appointment_id,
                follow_up_notes,
                admission_date,
                discharge_date,
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: appointment,
                message: "Appointment created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.insertAppointment: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async createFollowUpAppointmentForDoctor(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;
            const {
                date,
                time,
                reason,
                appointment_type,
                follow_up_notes,
                admission_date,
                discharge_date,
            } = req.body;

            const appointment = await AppointmentService.createFollowUpAppointmentForDoctor({
                doctor_id: person_id,
                parent_appointment_id: appointment_id,
                date,
                time,
                reason,
                appointment_type,
                follow_up_notes,
                admission_date,
                discharge_date,
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: appointment,
                message: "Follow-up appointment created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.createFollowUpAppointmentForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async createFollowUpAppointmentForPatient(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;
            const {
                date,
                time,
                reason,
                appointment_type,
                follow_up_notes,
                admission_date,
                discharge_date,
            } = req.body;

            const appointment = await AppointmentService.createFollowUpAppointmentForPatient({
                patient_id: person_id,
                parent_appointment_id: appointment_id,
                date,
                time,
                reason,
                appointment_type,
                follow_up_notes,
                admission_date,
                discharge_date,
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: appointment,
                message: "Follow-up appointment created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.createFollowUpAppointmentForPatient: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async approveAppointment(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;
            const { doctor_id, date, time, appointment_cost } = req.body;

            const appointment = await AppointmentService.approveAppointment({
                person_id,
                appointment_id,
                doctor_id,
                date,
                time,
                appointment_cost
            });

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Appointment approved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.approveAppointment: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async denyAppointment(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;

            const appointment = await AppointmentService.denyAppointment(person_id, appointment_id);

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Appointment denied successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.denyAppointment: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async cancelAppointment(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;

            const appointment = await AppointmentService.cancelAppointment(person_id, appointment_id);

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Appointment cancelled successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.cancelAppointment: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async rescheduleAppointmentForPatient(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;
            const { doctor_id, date, time, reason } = req.body;

            const appointment = await AppointmentService.rescheduleAppointmentForPatient({
                patient_id: person_id,
                appointment_id,
                doctor_id,
                date,
                time,
                reason
            });

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Appointment rescheduled successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.rescheduleAppointmentForPatient: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async rescheduleAppointmentForHospitalStaff(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;
            const { doctor_id, date, time } = req.body;

            const appointment = await AppointmentService.rescheduleAppointmentForHospitalStaff({
                person_id,
                appointment_id,
                doctor_id,
                date,
                time
            });

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Appointment rescheduled successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.rescheduleAppointmentForHospitalStaff: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async startAppointment(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;

            const appointment = await AppointmentService.startAppointment(person_id, appointment_id);

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Appointment started successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.startAppointment: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async hospitalizeAppointment(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;

            const appointment = await AppointmentService.hospitalizeAppointment(person_id, appointment_id);

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Appointment marked as hospitalization successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.hospitalizeAppointment: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async dischargeAppointment(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;
            const { history_of_present_illness, review_of_systems, physical_exam, diagnosis, plan } = req.body;

            const appointment = await AppointmentService.dischargeAppointment(person_id, appointment_id, {
                history_of_present_illness,
                review_of_systems,
                physical_exam,
                diagnosis,
                plan,
            });

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Appointment discharged successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.dischargeAppointment: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateAppointmentNotesForDoctor(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;
            const { history_of_present_illness, review_of_systems, physical_exam, diagnosis, plan } = req.body;

            const appointment = await AppointmentService.updateAppointmentNotesForDoctor({
                doctor_id: person_id,
                appointment_id,
                history_of_present_illness,
                review_of_systems,
                physical_exam,
                diagnosis,
                plan,
            });

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Appointment notes updated successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.updateAppointmentNotesForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async orderLabTests(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;

            const appointment = await AppointmentService.orderLabTests(
                person_id,
                appointment_id);

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Lab tests ordered successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        }
        catch (error) {
            console.error(`Error in AppointmentController.orderLabTests: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async completeAppointmentForDoctor(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;
            const { history_of_present_illness, review_of_systems, physical_exam, diagnosis, plan } = req.body;

            const appointment = await AppointmentService.completeAppointmentForDoctor({
                doctor_id: person_id,
                appointment_id,
                history_of_present_illness,
                review_of_systems,
                physical_exam,
                diagnosis,
                plan
            });

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Appointment completed successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in AppointmentController.completeAppointmentForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async completeLabTests(req, res) {
        try {
            const { person_id } = req.user;
            const { appointment_id } = req.params;

            const appointment = await AppointmentService.completeLabTests(
                person_id,
                appointment_id);

            return res.status(STATUS_CODES.OK).json({
                data: appointment,
                message: "Lab tests completed successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        }        catch (error) {
            console.error(`Error in AppointmentController.completeLabTests: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new AppointmentController();