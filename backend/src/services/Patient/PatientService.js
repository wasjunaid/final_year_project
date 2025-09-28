const { pool } = require("../../config/databaseConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class PatientService {
    static async getPatient(patient_id) {
        if (!patient_id) {
            throw new AppError('patient_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM patient
                WHERE
                patient_id = $1`,
                values: [patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('Patient not found', statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error getting patient: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async insertPatient(person_id) {
        if (!person_id) {
            throw new AppError('person_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `INSERT INTO patient
                (patient_id)
                VALUES
                ($1)
                RETURNING *`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('Error inserting patient', statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error inserting patient: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async insertPatientIfNotExists(person_id) {
        if (!person_id) {
            throw new AppError(`person_id is required`, statusCodes.BAD_REQUEST);
        }

        try {
            let patient;
            const patientExists = await this.checkPatientExists(person_id);
            if (!patientExists) {
                patient = await this.insertPatient(person_id);
            } else {
                patient = await this.getPatient(person_id);
            }

            return patient;
        } catch (error) {
            throw new AppError(`Error inserting patient: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async updatePatient(patient_id, updates) {
        if (!patient_id) {
            throw new AppError('patient_id is required', statusCodes.BAD_REQUEST);
        }
        if (Object.keys(updates).length === 0) {
            throw new AppError('No updates provided', statusCodes.BAD_REQUEST);
        }

        try {
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
                SET ${fields.join(', ')},
                updated_at = CURRENT_TIMESTAMP
                WHERE
                patient_id = $${index}
                RETURNING *`,
                values: [...values, patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error updating patient`, statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error updating patient: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async deletePatient(patient_id) {
        if (!patient_id) {
            throw new AppError('patient_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM patient
                WHERE
                patient_id = $1
                RETURNING *`,
                values: [patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error deleting patient`, statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            throw new AppError(`Error deleting patient: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async checkPatientExists(person_id) {
        if (!person_id) {
            throw new AppError('person_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM patient
                WHERE
                patient_id = $1`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return true;
        } catch (error) {
            throw new AppError(`Error checking patient existence: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { PatientService };