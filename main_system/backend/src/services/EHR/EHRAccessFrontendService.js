const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

class EHRAccessFrontendService {
    /**
     * Retrieves all EHR access records for a given patient with doctor details.
     * Used by frontend to display access requests for patients.
     * @param {number} patient_id - The ID of the patient.
     * @return {Promise<Array<object>|boolean>} Array of EHR access records with doctor details if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAllEHRAccessForPatientIfExistsForFrontend(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT 
                    ea.ehr_access_id,
                    ea.patient_id,
                    d.doctor_id AS requester_id,
                    ea.status,
                    pd.first_name AS patient_first_name,
                    pd.last_name AS patient_last_name,
                    pd.email AS patient_email,
                    dd.first_name AS doctor_first_name,
                    dd.last_name AS doctor_last_name,
                    dd.email AS doctor_email,
                    ea.created_at
                FROM ehr_access ea
                LEFT JOIN doctor d ON d.doctor_id = ea.doctor_id
                LEFT JOIN person_view pd ON pd.person_id = ea.patient_id
                LEFT JOIN person_view dd ON dd.person_id = d.doctor_id
                WHERE ea.patient_id = $1
                ORDER BY ea.created_at DESC`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }
            
            return result.rows;
        } catch (error) {
            console.error(`Error in EHRAccessFrontendService.getAllEHRAccessForPatientIfExistsForFrontend: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Retrieves all EHR access records for a given doctor with patient details.
     * Used by frontend to display access requests for doctors.
     * @param {number} doctor_id - The ID of the doctor.
     * @return {Promise<Array<object>|boolean>} Array of EHR access records with patient details if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAllEHRAccessForDoctorIfExistsForFrontend(doctor_id) {
        try {
            if (!doctor_id) {
                throw new AppError('doctor_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT 
                    ea.ehr_access_id,
                    ea.patient_id,
                    d.doctor_id AS requester_id,
                    ea.status,
                    pd.first_name AS patient_first_name,
                    pd.last_name AS patient_last_name,
                    pd.email AS patient_email,
                    dd.first_name AS doctor_first_name,
                    dd.last_name AS doctor_last_name,
                    dd.email AS doctor_email,
                    ea.created_at
                FROM ehr_access ea
                LEFT JOIN doctor d ON d.doctor_id = ea.doctor_id
                LEFT JOIN person_view pd ON pd.person_id = ea.patient_id
                LEFT JOIN person_view dd ON dd.person_id = d.doctor_id
                WHERE ea.doctor_id = $1
                ORDER BY ea.created_at DESC`,
                values: [doctor_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }
            
            return result.rows;
        } catch (error) {
            console.error(`Error in EHRAccessFrontendService.getAllEHRAccessForDoctorIfExistsForFrontend: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { EHRAccessFrontendService };
