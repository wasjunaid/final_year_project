const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { ContactService } = require("../Contact/ContactService");
const { LogService } = require("../Log/LogService");
class PatientService {
    /**
     * Retrieves a patient by their ID if they exist.
     * @param {number} patient_id - The ID of the patient to retrieve.
     * @returns {Promise<Object|boolean>} - The patient object if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getPatientIfExists(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM patient_view
                WHERE
                patient_id = $1`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientService.getPatientIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new patient into the database.
     * @param {number} person_id - The ID of the person to insert as a patient.
     * @returns {Promise<Object>} - The newly created patient object.
     * @throws {AppError} if any issue occurs
     */
    static async insertPatientIfNotExists(person_id) {
        try {
            if (!person_id) {
                throw new AppError('person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO patient
                (patient_id)
                VALUES
                ($1)
                ON CONFLICT (patient_id)
                DO
                UPDATE
                SET
                patient_id = EXCLUDED.patient_id
                RETURNING *`,
                values: [person_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Error inserting patient', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientService.insertPatientIfNotExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Updates patient details.
     * @param {number} patient_id - The ID of the patient to update.
     * @param {Object} updates - The updates to apply to the patient.
     * @returns {Promise<Object>} - The updated patient object.
     * @throws {AppError} if any issue occurs
     */
    static async updatePatient(patient_id, updates = {}) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (Object.keys(updates).length === 0) {
                throw new AppError('No updates provided', STATUS_CODES.BAD_REQUEST);
            }

            if (updates.country_code && updates.number)
            {
                const contactRecord = await ContactService.insertContactIfNotExists(updates.country_code, updates.number);
                updates.emergency_contact_id = contactRecord.contact_id;
                delete updates.country_code;
                delete updates.number;
            }

            const fields = [];
            const values = [];
            let index = 1;

            for (const [key, value] of Object.entries(updates)) {
                fields.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }

            const query = {
                text: `UPDATE patient
                SET ${fields.join(', ')}
                WHERE
                patient_id = $${index}
                RETURNING *`,
                values: [...values, patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(`Error updating patient`, STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            await LogService.insertLog(patient_id, `Updated patient: ${JSON.stringify(updates)}`);

            if (!result.rows[0].is_profile_complete) {
                const isCompleted = await this.completeProfileIfCompleted(patient_id);
                if (isCompleted) {
                    return isCompleted;
                }
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientService.updatePatient: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Marks patient profile as complete if all fields are filled.
     * @param {number} patient_id - The ID of the patient to check and update.
     * @returns {Promise<Object>} - The updated patient object with profile marked as complete.
     * @throws {AppError} if any issue occurs
     */
    static async completeProfileIfCompleted(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const patient = await this.getPatientIfExists(patient_id);
            if (!patient) {
                throw new AppError('Patient does not exist', STATUS_CODES.NOT_FOUND);
            }

            for (const [key, value] of Object.entries(patient)) {
                if (value === null) {
                    return false;
                }
            }

            const query = {
                text: `UPDATE patient
                SET is_profile_complete = TRUE
                WHERE patient_id = $1
                RETURNING *`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Error completing profile', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientService.completeProfileIfCompleted: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PatientService };