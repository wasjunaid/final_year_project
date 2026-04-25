const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { validateID } = require("../../utils/idUtil");
const { VALID_APPOINTMENT_STATUSES_OBJECT } = require("../../validations/appointment/appointmentValidations");

class AppointmentDetailService {
    static async getAppointmentDetailsIfExists(appointment_id) {
        try {
            if (!appointment_id) {
                throw new AppError("Appointment ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM appointment_view WHERE appointment_id = $1`,
                values: [appointment_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in AppointmentDetailService.getAppointmentDetailsIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

     /**
     * Retrieves all completed appointments for a specific patient if they exist.
     * Used for EHR retrieval.
     * @param {number|string} patient_id - The ID of the patient whose completed appointments to retrieve.
     * @returns {Promise<Array|boolean>} - An array of completed appointment objects if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAppointmentsForEHRIfExists(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            patient_id = validateID(patient_id);

            const query = {
                text: `SELECT * FROM appointment_view
                WHERE
                patient_id = $1 AND status = '${VALID_APPOINTMENT_STATUSES_OBJECT.COMPLETED}'
                ORDER BY
                date ASC, time ASC`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in AppointmentDetailService.getAppointmentsForEHRIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { AppointmentDetailService };