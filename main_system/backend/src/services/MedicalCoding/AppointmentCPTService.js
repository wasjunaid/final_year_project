const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { CPTService } = require("./CPTService");

class AppointmentCPTService {
    static async getAppointmentCPTCodesIfExists(appointment_id) {
        try {
            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM appointment_cpt_view WHERE appointment_id = $1`,
                values: [appointment_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in AppointmentCPTService.getAppointmentCPTCodesIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertAppointmentCPTCode(appointment_id, cpt_code, cpt_description) {
        try {
            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!cpt_code) {
                throw new AppError("cpt_code is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!cpt_description) {
                throw new AppError("cpt_description is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof cpt_description !== 'string') {
                throw new AppError("cpt_description must be a string", STATUS_CODES.BAD_REQUEST);
            }

            cpt_description = cpt_description.trim();

            if (cpt_description.length === 0) {
                throw new AppError("cpt_description cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            await CPTService.insertCPTCodeIfNotExists(cpt_code, cpt_description);

            const query = {
                text: `INSERT INTO appointment_cpt
                (appointment_id, cpt_code)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [appointment_id, cpt_code]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert appointment CPT code", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in AppointmentCPTService.insertAppointmentCPTCode: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { AppointmentCPTService };