const { pool } = require("../../config/databaseConfig");
const { validEHRAccessStatuses } = require("../../database/EHR/EHRAccessTableQuery");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class EHRAccessService {
    static async getEHRAccessForPatient(patient_id) {
        if (!patient_id) {
            throw new AppError('patient_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM ehr_access
                WHERE patient_id = $1`,
                values: [patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('No EHR access records found for the given patient_id', statusCodes.NOT_FOUND);
            }
            
            return result.rows;
        } catch (error) {
            console.error(`Error in getEHRAccessForPatient: ${error.message}`);
            throw new AppError('Internal Server Error', statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async getEHRAccessForDoctor(doctor_id) {
        if (!doctor_id) {
            throw new AppError('doctor_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM ehr_access
                WHERE doctor_id = $1`,
                values: [doctor_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('No EHR access records found for the given doctor_id', statusCodes.NOT_FOUND);
            }
            
            return result.rows;
        } catch (error) {
            console.error(`Error in getEHRAccessForDoctor: ${error.message}`);
            throw new AppError('Internal Server Error', statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    
    static async insertEHRAccess(patient_id, doctor_id) {
        if (!patient_id) {
            throw new AppError('patient_id is required', statusCodes.BAD_REQUEST);
        }
        if (!doctor_id) {
            throw new AppError('doctor_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const checkExists = await this.checkEHRAccessExists(patient_id, doctor_id);
            if (checkExists) {
                const updateAccess = await this.updateEHRAccessStatus(patient_id, checkExists, 'granted');

                return updateAccess;
            }

            const query = {
                text: `INSERT INTO ehr_access
                (patient_id, doctor_id)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [patient_id, doctor_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('Failed to insert EHR access record', statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in insertEHRAccess: ${error.message}`);
            throw new AppError('Internal Server Error', statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async updateEHRAccessStatus(patient_id, ehr_access_id, status) {
        if (!patient_id) {
            throw new AppError('patient_id is required', statusCodes.BAD_REQUEST);
        }
        if (!ehr_access_id) {
            throw new AppError('ehr_access_id is required', statusCodes.BAD_REQUEST);
        }
        if (!status) {
            throw new AppError('status is required', statusCodes.BAD_REQUEST);
        }
        if (!validEHRAccessStatuses.includes(status)) {
            throw new AppError(`Invalid status`, statusCodes.BAD_REQUEST);
        }

        try {
            const checkOwnership = await this.checkEHRAccessOwnership(patient_id, ehr_access_id);
            if (!checkOwnership) {
                throw new AppError('EHR access record does not belong to the given patient_id', statusCodes.FORBIDDEN);
            }

            const query = {
                text: `UPDATE ehr_access
                SET status = $1,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                ehr_access_id = $2
                RETURNING *`,
                values: [status, ehr_access_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('No EHR access record found for the given ehr_access_id', statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in updateEHRAccessStatus: ${error.message}`);
            throw new AppError('Internal Server Error', statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async grantEHRAccess(patient_id, ehr_access_id) {
        if (!patient_id) {
            throw new AppError('patient_id is required', statusCodes.BAD_REQUEST);
        }
        if (!ehr_access_id) {
            throw new AppError('ehr_access_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const updateAccess = await this.updateEHRAccessStatus(patient_id, ehr_access_id, 'granted');

            return updateAccess;
        } catch (error) {
            console.error(`Error in grantEHRAccess: ${error.message}`);
            throw new AppError('Internal Server Error', statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async revokeEHRAccess(patient_id, ehr_access_id) {
        if (!patient_id) {
            throw new AppError('patient_id is required', statusCodes.BAD_REQUEST);
        }
        if (!ehr_access_id) {
            throw new AppError('ehr_access_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const updateAccess = await this.updateEHRAccessStatus(patient_id, ehr_access_id, 'revoked');

            return updateAccess;
        } catch (error) {
            console.error(`Error in revokeEHRAccess: ${error.message}`);
            throw new AppError('Internal Server Error', statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async checkEHRAccessExists(patient_id, doctor_id) {
        if (!patient_id) {
            throw new AppError('patient_id is required', statusCodes.BAD_REQUEST);
        }
        if (!doctor_id) {
            throw new AppError('doctor_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM ehr_access
                WHERE patient_id = $1 AND doctor_id = $2`,
                values: [patient_id, doctor_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0].ehr_access_id;
        } catch (error) {
            console.error(`Error in checkEHRAccessExists: ${error.message}`);
            throw new AppError('Internal Server Error', statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async checkEHRAccessOwnership(patient_id, ehr_access_id) {
        if (!patient_id) {
            throw new AppError('patient_id is required', statusCodes.BAD_REQUEST);
        }
        if (!ehr_access_id) {
            throw new AppError('ehr_access_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM ehr_access
                WHERE patient_id = $1 AND ehr_access_id = $2`,
                values: [patient_id, ehr_access_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Error in checkEHRAccessOwnership: ${error.message}`);
            throw new AppError('Internal Server Error', statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { EHRAccessService };