const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { ICDService } = require("./ICDService");

class AppointmentICDService {
    static async getAppointmentICDCodesIfExists(appointment_id) {
        try {
            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM appointment_icd_view WHERE appointment_id = $1`,
                values: [appointment_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in AppointmentICDService.getAppointmentICDCodesIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertAppointmentICDCode(appointment_id, icd_code, icd_description) {
        try {
            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!icd_code) {
                throw new AppError("icd_code is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!icd_description) {
                throw new AppError("icd_description is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof icd_description !== 'string') {
                throw new AppError("icd_description must be a string", STATUS_CODES.BAD_REQUEST);
            }

            icd_description = icd_description.trim();

            if (icd_description.length === 0) {
                throw new AppError("icd_description cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            await ICDService.insertICDCodeIfNotExists(icd_code, icd_description);

            const query = {
                text: `INSERT INTO appointment_icd
                (appointment_id, icd_code)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [appointment_id, icd_code]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert appointment ICD code", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in AppointmentICDService.insertAppointmentICDCode: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { AppointmentICDService };