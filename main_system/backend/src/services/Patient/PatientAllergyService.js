const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

class PatientAllergyService {
    static async getPatientAllergiesIfExists(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM patient_allergy
                WHERE patient_id = $1`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in PatientAllergyService.getPatientAllergiesIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertPatientAllergyIfNotExists(patient_id, allergy_name) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!allergy_name) {
                throw new AppError('allergy_name is required', STATUS_CODES.BAD_REQUEST);
            }

            if (typeof allergy_name !== 'string') {
                throw new AppError('allergy_name must be a string', STATUS_CODES.BAD_REQUEST);
            }

            allergy_name = allergy_name.trim().toLowerCase();

            if (allergy_name.length === 0) {
                throw new AppError('allergy_name cannot be empty', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO patient_allergy (patient_id, allergy_name)
                VALUES ($1, $2)
                ON CONFLICT (patient_id, allergy_name)
                DO
                UPDATE
                SET
                allergy_name = EXCLUDED.allergy_name
                RETURNING *`,
                values: [patient_id, allergy_name]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Failed to insert patient allergy', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientAllergyService.insertPatientAllergy: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PatientAllergyService };