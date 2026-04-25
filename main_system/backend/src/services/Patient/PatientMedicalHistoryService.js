const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

class PatientMedicalHistoryService {
    static async getPatientMedicalHistoryIfExists(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM patient_medical_history
                WHERE patient_id = $1`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in PatientMedicalHistoryService.getPatientMedicalHistoryIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertPatientMedicalHistoryIfNotExists(patient_id, condition_name, diagnosis_date) {
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

            if (!diagnosis_date) {
                throw new AppError('diagnosis_date is required', STATUS_CODES.BAD_REQUEST);
            }

            if (isNaN(new Date(diagnosis_date).getTime())) {
                throw new AppError('diagnosis_date must be a valid date', STATUS_CODES.BAD_REQUEST);
            }

            if (new Date(diagnosis_date) > new Date()) {
                throw new AppError('diagnosis_date cannot be in the future', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO patient_medical_history (patient_id, condition_name, diagnosis_date)
                VALUES ($1, $2, $3)
                ON CONFLICT (patient_id, condition_name, diagnosis_date)
                DO
                UPDATE
                SET
                condition_name = EXCLUDED.condition_name
                RETURNING *`,
                values: [patient_id, condition_name, diagnosis_date]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Failed to insert patient medical history', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientMedicalHistoryService.insertPatientMedicalHistory: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PatientMedicalHistoryService };