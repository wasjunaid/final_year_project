const { pool } = require("../../config/databaseConfig");
const { validAppointmentStatuses } = require("../../database/appointment/appointmentTableQuery");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class AppointmentService {
    static async getAppointmentsForPatient(patient_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT a.*,
                ar.patient_id,
                ar.hospital_id,
                TO_CHAR(ar.date, 'YYYY-MM-DD') AS date,
                TO_CHAR(ar.time, 'HH24:MI') AS time,
                ar.reason,
                ad.address AS hospital_address,
                h.name AS hospital_name,
                p.first_name AS doctor_first_name,
                p.last_name AS doctor_last_name,
                p.email AS doctor_email,
                FROM appointment a
                JOIN appointment_request ar ON a.appointment_id = ar.appointment_request_id
                JOIN hospital h ON ar.hospital_id = h.hospital_id
                JOIN address ad ON h.address_id = ad.address_id
                JOIN person p ON ar.doctor_id = p.person_id
                WHERE
                ar.patient_id = $1`,
                values: [patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No appointments found for this patient", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error fetching appointments: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getAppointmentsForDoctor(doctor_id) {
        if (!doctor_id) {
            throw new AppError("doctor_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT a.*,
                ar.patient_id,
                ar.hospital_id,
                TO_CHAR(ar.date, 'YYYY-MM-DD') AS date,
                TO_CHAR(ar.time, 'HH24:MI') AS time,
                ar.reason,
                ad.address AS hospital_address,
                h.name AS hospital_name,
                p.first_name AS patient_first_name,
                p.last_name AS patient_last_name,
                p.email AS patient_email
                FROM appointment a
                JOIN appointment_request ar ON a.appointment_id = ar.appointment_request_id
                JOIN hospital h ON ar.hospital_id = h.hospital_id
                JOIN address ad ON h.address_id = ad.address_id
                JOIN person p ON ar.patient_id = p.person_id
                WHERE
                a.doctor_id = $1`,
                values: [doctor_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No appointments found for this doctor", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error fetching appointments: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getAppointmentsForHospital(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const hospitalStaff = await HospitalStaffService.checkHospitalStaffExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("You are not a staff member of any hospital", statusCodes.FORBIDDEN);
            }
            if (hospitalStaff.role === 'lab technician') {
                throw new AppError("Lab technicians do not have access to all appointments", statusCodes.FORBIDDEN);
            }

            const query = {
                text: `SELECT a.*,
                ar.patient_id,
                TO_CHAR(ar.date, 'YYYY-MM-DD') AS date,
                TO_CHAR(ar.time, 'HH24:MI') AS time,
                ar.reason,
                p.first_name AS patient_first_name,
                p.last_name AS patient_last_name,
                p.email AS patient_email,
                d.first_name AS doctor_first_name,
                d.last_name AS doctor_last_name,
                d.email AS doctor_email
                FROM appointment a
                JOIN appointment_request ar ON a.appointment_id = ar.appointment_request_id
                JOIN person p ON ar.patient_id = p.person_id
                JOIN person d ON ar.doctor_id = d.person_id
                WHERE
                ar.hospital_id = $1`,
                values: [hospitalStaff.hospital_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No appointments found for this hospital", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error fetching appointments: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertAppointment(appointment_request_id, cost, status = 'upcoming') {
        if (!appointment_request_id) {
            throw new AppError("appointment_request_id is required", statusCodes.BAD_REQUEST);
        }
        if (!validAppointmentStatuses.includes(status)) {
            throw new AppError(`Invalid status`, statusCodes.BAD_REQUEST);
        }
        if (cost === undefined || cost < 0) {
            throw new AppError("Invalid cost", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `INSERT INTO appointment
                (appointment_id, status, cost)
                VALUES
                ($1, $2, $3)
                RETURNING *`,
                values: [appointment_request_id, status, cost]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to insert appointment", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting appointment: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updateAppointmentStatus(person_id, appointment_id, status) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!appointment_id) {
            throw new AppError("appointment_id is required", statusCodes.BAD_REQUEST);
        }
        if (!status) {
            throw new AppError("status is required", statusCodes.BAD_REQUEST);
        }
        if (!validAppointmentStatuses.includes(status)) {
            throw new AppError(`Invalid status`, statusCodes.BAD_REQUEST);
        }

        try {
            const checkQuery = {
                text: `SELECT * FROM appointment_request
                WHERE appointment_request_id = $1`,
                values: [appointment_id]
            };
            const checkResult = await pool.query(checkQuery);
            if (checkResult.rows.length === 0) {
                throw new AppError("Appointment request not found", statusCodes.NOT_FOUND);
            }
            if (checkResult.rows[0].doctor_id !== person_id) {
                throw new AppError("You do not have permission to update this appointment", statusCodes.FORBIDDEN);
            }

            const query = {
                text: `UPDATE appointment
                SET status = $1,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                appointment_id = $2
                RETURNING *`,
                values: [status, appointment_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to update appointment status", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating appointment status: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deleteAppointment(appointment_id) {
        if (!appointment_id) {
            throw new AppError("appointment_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM appointment
                WHERE
                appointment_id = $1
                RETURNING *`,
                values: [appointment_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to delete appointment", statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            console.error(`Error deleting appointment: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getUpcomingAppointments() {
        try {
            const today = new Date();
            const todayDate = today.toISOString().split("T")[0];

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowDate = tomorrow.toISOString().split("T")[0];

            const query = {
              text: `SELECT
              a.appointment_id,
              ar.doctor_id,
              ar.patient_id,
              TO_CHAR(ar.date, 'YYYY-MM-DD') AS date,
              TO_CHAR(ar.time, 'HH24:MI') AS time,
              ar.reason,
              h.name AS hospital_name,
              ad.address AS hospital_address,
              p.first_name AS patient_first_name,
              p.last_name AS patient_last_name,
              p.email AS patient_email,
              d.first_name AS doctor_first_name,
              d.last_name AS doctor_last_name,
              d.email AS doctor_email
              FROM appointment a
              JOIN appointment_request ar ON a.appointment_id = ar.appointment_request_id
              JOIN hospital h ON ar.hospital_id = h.hospital_id
              JOIN address ad ON h.address_id = ad.address_id
              JOIN person p ON ar.patient_id = p.person_id
              JOIN person d ON ar.doctor_id = d.person_id
              WHERE
              (ar.date = $1 OR ar.date = $2)
              AND a.status = 'upcoming'
              ORDER BY
              ar.date ASC, ar.time ASC`,
              values: [todayDate, tomorrowDate]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No upcoming appointments found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error fetching upcoming appointments: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkAppointmentExists(appointment_id) {
        if (!appointment_id) {
            throw new AppError("appointment_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM appointment
                WHERE
                appointment_id = $1`,
                values: [appointment_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error checking appointment exists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getAppointmentsForEHR(patient_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        
        try {
            const query = {
                text: `SELECT
                ar.doctor_id,
                TO_CHAR(ar.date, 'YYYY-MM-DD') AS appointment_date,
                TO_CHAR(ar.time, 'HH24:MI') AS appointment_time,
                ar.reason AS appointment_reason,
                d.specialization AS doctor_specialization,
                p.first_name AS doctor_first_name,
                p.last_name AS doctor_last_name,
                dn.note AS doctor_note
                FROM appointment a
                JOIN appointment_request ar ON a.appointment_id = ar.appointment_request_id
                JOIN doctor d ON ar.doctor_id = d.doctor_id
                JOIN person p ON d.person_id = p.person_id
                JOIN doctor_note dn ON a.appointment_id = dn.appointment_id
                WHERE
                ar.patient_id = $1 AND a.status = 'completed'`,
                values: [patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error fetching appointments for EHR: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { AppointmentService };