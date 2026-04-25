const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

class PatientFamilyHistoryService {
    static async getPatientFamilyHistoryIfExists(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM patient_family_history
                WHERE patient_id = $1`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in PatientFamilyHistoryService.getPatientFamilyHistoryIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertPatientFamilyHistoryIfNotExists(patient_id, condition_name) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!condition_name) {
                throw new AppError('condition_name is required', STATUS_CODES.BAD_REQUEST);
            }

            if (typeof condition_name !== 'string') {
                throw new AppError('condition_name must be a string', STATUS_CODES.BAD_REQUEST);
            }

            condition_name = condition_name.trim().toLowerCase();

            if (condition_name.length === 0) {
                throw new AppError('condition_name cannot be empty', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO patient_family_history (patient_id, condition_name)
                VALUES ($1, $2)
                ON CONFLICT (patient_id, condition_name)
                DO
                UPDATE
                SET
                condition_name = EXCLUDED.condition_name
                RETURNING *`,
                values: [patient_id, condition_name]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Failed to insert patient family history', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientFamilyHistoryService.insertPatientFamilyHistory: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PatientFamilyHistoryService };