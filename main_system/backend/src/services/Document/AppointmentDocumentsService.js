const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

class AppointmentDocumentsService {
    static async getVerifiedDocumentsAgainstAppointmentIfExists(appointment_id) {
        try {
            if (!appointment_id) {
                throw new AppError("Appointment ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM verified_document_view WHERE appointment_id = $1`,
                values: [appointment_id],
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in AppointmentDocumentsService.getVerifiedDocumentsAgainstAppointmentIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getUnverifiedDocumentsAgainstAppointmentIfExists(appointment_id) {
        try {
            if (!appointment_id) {
                throw new AppError("Appointment ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM unverified_document_view WHERE appointment_id = $1`,
                values: [appointment_id],
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in AppointmentDocumentsService.getUnverifiedDocumentsAgainstAppointmentIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { AppointmentDocumentsService };