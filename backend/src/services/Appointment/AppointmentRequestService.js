const { pool } = require("../../config/databaseConfig");
const { AppointmentService } = require("./AppointmentService");
const { validAppointmentRequestStatuses } = require("../../database/appointment/appointmentRequestTableQuery");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { DoctorService } = require("../Doctor/DoctorService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class AppointmentRequestService {
    static async getAppointmentRequestsForPatient(patient_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT ar.*,
                h.name AS hospital_name,
                ad.address AS hospital_address,
                d.*,
                p.first_name AS doctor_first_name,
                p.last_name AS doctor_last_name,
                p.email AS doctor_email
                FROM appointment_request ar
                JOIN hospital h ON ar.hospital_id = h.hospital_id
                JOIN address ad ON h.address_id = ad.address_id
                JOIN doctor d ON ar.doctor_id = d.doctor_id
                JOIN person p ON d.person_id = p.person_id
                WHERE
                ar.patient_id = $1`,
                values: [patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No appointment requests found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error fetching appointment requests: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getAppointmentRequestsForHospital(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const checkStaff = await HospitalStaffService.checkHospitalStaffExists(person_id);
            if (!checkStaff) {
                throw new AppError("You do not have permission to view appointment requests for this hospital", statusCodes.FORBIDDEN);
            }
            if (checkStaff.role === 'lab technician') {
                throw new AppError("Lab technicians cannot view appointment requests for this hospital", statusCodes.FORBIDDEN);
            }

            const query = {
                text: `SELECT ar.*,
                p.first_name AS patient_first_name,
                p.last_name AS patient_last_name,
                p.email AS patient_email,
                d.*,
                p2.first_name AS doctor_first_name,
                p2.last_name AS doctor_last_name,
                p2.email AS doctor_email
                FROM appointment_request ar
                JOIN person p ON ar.patient_id = p.person_id
                JOIN doctor d ON ar.doctor_id = d.doctor_id
                JOIN person p2 ON d.person_id = p2.person_id
                WHERE
                ar.hospital_id = $1`,
                values: [checkStaff.hospital_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No appointment requests found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error fetching appointment requests: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertAppointmentRequest(patient_id, {
        hospital_id,
        doctor_id,
        date,
        time,
        reason
    }) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!hospital_id) {
            throw new AppError("hospital_id is required", statusCodes.BAD_REQUEST);
        }
        if (!date) {
            throw new AppError("date is required", statusCodes.BAD_REQUEST);
        }
        if (!time) {
            throw new AppError("time is required", statusCodes.BAD_REQUEST);
        }
        if (!reason) {
            throw new AppError("reason is required", statusCodes.BAD_REQUEST);
        }

        try {
            const checkClash = await this.checkAppointmentRequestClash(doctor_id, date, time);
            if (checkClash) {
                throw new AppError("Appointment clash detected for the selected doctor at the given date and time", statusCodes.CONFLICT);
            }

            const checkDoctor = await DoctorService.checkDoctorExistsAgainstHospitalID(doctor_id, hospital_id);
            if (!checkDoctor) {
                throw new AppError("The selected doctor does not belong to the selected hospital", statusCodes.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO appointment_request
                (patient_id, hospital_id, doctor_id, date, time, reason)
                VALUES
                ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                values: [patient_id, hospital_id, doctor_id, date, time, reason]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to insert appointment request", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting appointment request: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updateAppointmentRequestStatusForHospital(person_id, {
        appointment_request_id,
        doctor_id,
        date,
        time,
        status
    }) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!appointment_request_id) {
            throw new AppError("appointment_request_id is required", statusCodes.BAD_REQUEST);
        }
        if (!doctor_id) {
            throw new AppError("doctor_id is required", statusCodes.BAD_REQUEST);
        }
        if (!date) {
            throw new AppError("date is required", statusCodes.BAD_REQUEST);
        }
        if (!time) {
            throw new AppError("time is required", statusCodes.BAD_REQUEST);
        }
        if (!status) {
            throw new AppError("status is required", statusCodes.BAD_REQUEST);
        }
        if (!validAppointmentRequestStatuses.includes(status)) {
            throw new AppError("Invalid status", statusCodes.BAD_REQUEST);
        }

        try {
            const checkHospitalStaff = await HospitalStaffService.checkHospitalStaffExists(person_id);
            if (!checkHospitalStaff) {
                throw new AppError("You do not have permission to update appointment request status", statusCodes.FORBIDDEN);
            }
            if (checkHospitalStaff.role === 'lab technician') {
                throw new AppError("Lab technicians cannot update appointment request status", statusCodes.FORBIDDEN);
            }

            const checkAppointmentRequestExists = await this.checkAppointmentRequestExists(appointment_request_id);
            if (!checkAppointmentRequestExists) {
                throw new AppError("Appointment request does not exist", statusCodes.NOT_FOUND);
            }

            if (checkAppointmentRequestExists.hospital_id !== checkHospitalStaff.hospital_id) {
                throw new AppError("You do not have permission to update appointment requests for this hospital", statusCodes.FORBIDDEN);
            }

            const checkDoctor = await DoctorService.checkDoctorExistsAgainstHospitalID(doctor_id, checkHospitalStaff.hospital_id);
            if (!checkDoctor) {
                throw new AppError("The selected doctor does not belong to the selected hospital", statusCodes.BAD_REQUEST);
            }

            if (status === "approved") {
                const checkClash = await this.checkAppointmentRequestClash(doctor_id, date, time);
                if (checkClash) {
                    throw new AppError("Appointment clash detected for the selected doctor at the given date and time", statusCodes.CONFLICT);
                }
                await AppointmentService.insertAppointment(appointment_request_id);
            } else if (status === "denied") {
                const appointmentExists = await AppointmentService.checkAppointmentExists(appointment_request_id);
                if (appointmentExists) {
                    await AppointmentService.deleteAppointment(appointment_request_id);
                }
            }

            const query = {
                text: `UPDATE appointment_request
                SET status = $1,
                doctor_id = $2,
                date = $3,
                time = $4,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                appointment_request_id = $5
                RETURNING *`,
                values: [status, doctor_id, date, time, appointment_request_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to update appointment request status", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating appointment request status: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async cancelAppointmentRequest(patient_id, appointment_request_id, status = "cancelled") {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!appointment_request_id) {
            throw new AppError("appointment_request_id is required", statusCodes.BAD_REQUEST);
        }
        if (!validAppointmentRequestStatuses.includes(status)) {
            throw new AppError("Invalid status", statusCodes.BAD_REQUEST);
        }

        try {
            const checkOwnership = await this.checkAppointmentRequestOwnership(patient_id, appointment_request_id);
            if (!checkOwnership) {
                throw new AppError("You do not have permission to cancel this appointment request", statusCodes.FORBIDDEN);
            }

            const query = {
                text: `UPDATE appointment_request
                SET status = $1,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                appointment_request_id = $2
                RETURNING *`,
                values: [status, appointment_request_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to cancel appointment request", statusCodes.INTERNAL_SERVER_ERROR);
            }

            const appointmentExists = await AppointmentService.checkAppointmentExists(appointment_request_id);
            if (appointmentExists) {
                await AppointmentService.updateAppointmentStatus(appointment_request_id, status);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error cancelling appointment request: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async rescheduleAppointmentRequest(patient_id, {
        appointment_request_id,
        date,
        time,
        reason,
        status = "processing"
    }) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!appointment_request_id) {
            throw new AppError("appointment_request_id is required", statusCodes.BAD_REQUEST);
        }
        if (!date) {
            throw new AppError("date is required", statusCodes.BAD_REQUEST);
        }
        if (!time) {
            throw new AppError("time is required", statusCodes.BAD_REQUEST);
        }
        if (!reason) {
            throw new AppError("reason is required", statusCodes.BAD_REQUEST);
        }
        if (!validAppointmentRequestStatuses.includes(status)) {
            throw new AppError("Invalid status", statusCodes.BAD_REQUEST);
        }

        try {
            const checkOwnership = await this.checkAppointmentRequestOwnership(patient_id, appointment_request_id);
            if (!checkOwnership) {
                throw new AppError("You do not have permission to reschedule this appointment request", statusCodes.FORBIDDEN);
            }

            const query = {
                text: `UPDATE appointment_request
                SET date = $1,
                time = $2,
                status = $3,
                reason = $4,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                appointment_request_id = $5
                RETURNING *`,
                values: [date, time, status, reason, appointment_request_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to reschedule appointment request", statusCodes.INTERNAL_SERVER_ERROR);
            }

            const appointmentExists = await AppointmentService.checkAppointmentExists(appointment_request_id);
            if (appointmentExists) {
                await AppointmentService.deleteAppointment(appointment_request_id);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error resheduling appointment request: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkAppointmentRequestExists(appointment_request_id) {
        if (!appointment_request_id) {
            throw new AppError("appointment_request_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM appointment_request
                WHERE
                appointment_request_id = $1`,
                values: [appointment_request_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error checking appointment request exists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkAppointmentRequestOwnership(patient_id, appointment_request_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!appointment_request_id) {
            throw new AppError("appointment_request_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM appointment_request
                WHERE
                patient_id = $1 AND appointment_request_id = $2`,
                values: [patient_id, appointment_request_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Error checking appointment request ownership: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkAppointmentRequestClash(doctor_id, date, time) {
        if (!doctor_id) {
            throw new AppError("doctor_id is required", statusCodes.BAD_REQUEST);
        }
        if (!date) {
            throw new AppError("date is required", statusCodes.BAD_REQUEST);
        }
        if (!time) {
            throw new AppError("time is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM appointment_request
                WHERE
                doctor_id = $1 AND date = $2 AND time = $3 AND status = 'approved'`,
                values: [doctor_id, date, time]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Error checking appointment request clash: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { AppointmentRequestService };