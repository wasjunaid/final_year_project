const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

class PatientSurgicalHistoryService {
    static async getPatientSurgicalHistoryIfExists(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM patient_surgical_history
                WHERE patient_id = $1`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in PatientSurgicalHistoryService.getPatientSurgicalHistoryIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertPatientSurgicalHistoryIfNotExists(patient_id, surgery_name, surgery_date) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!surgery_name) {
                throw new AppError('surgery_name is required', STATUS_CODES.BAD_REQUEST);
            }

            if (typeof surgery_name !== 'string') {
                throw new AppError('surgery_name must be a string', STATUS_CODES.BAD_REQUEST);
            }

            surgery_name = surgery_name.trim().toLowerCase();

            if (surgery_name.length === 0) {
                throw new AppError('surgery_name cannot be empty', STATUS_CODES.BAD_REQUEST);
            }

            if (!surgery_date) {
                throw new AppError('surgery_date is required', STATUS_CODES.BAD_REQUEST);
            }

            if (isNaN(new Date(surgery_date).getTime())) {
                throw new AppError('surgery_date must be a valid date', STATUS_CODES.BAD_REQUEST);
            }

            if (new Date(surgery_date) > new Date()) {
                throw new AppError('surgery_date cannot be in the future', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO patient_surgical_history (patient_id, surgery_name, surgery_date)
                VALUES ($1, $2, $3)
                ON CONFLICT (patient_id, surgery_name, surgery_date)
                DO
                UPDATE
                SET
                surgery_name = EXCLUDED.surgery_name
                RETURNING *`,
                values: [patient_id, surgery_name, surgery_date]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Failed to insert patient surgical history', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientSurgicalHistoryService.insertPatientSurgicalHistory: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PatientSurgicalHistoryService };