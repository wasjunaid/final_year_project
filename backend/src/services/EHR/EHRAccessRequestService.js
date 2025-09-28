const { pool } = require("../../config/databaseConfig");
const { validEHRAccessRequestStatuses } = require("../../database/EHR/EHRAccessRequestTableQuery");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class EHRAccessRequestService {
    static async getEHRAccessRequest(doctor_id, patient_id) {
        if (!doctor_id) {
            throw new AppError("doctor_id is required", statusCodes.BAD_REQUEST);
        }
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM ehr_access_request
                WHERE doctor_id = $1 AND patient_id = $2`,
                values: [doctor_id, patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("EHR access request not found", statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`error in getEHRAccessRequest ${error.message}`);
            throw new AppError("Internal Server Error", statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async getEHRAccessRequestsForPatient(patient_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM ehr_access_request
                WHERE patient_id = $1`,
                values: [patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No EHR access requests found for this patient", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`error in getEHRAccessRequestsForPatient ${error.message}`);
            throw new AppError("Internal Server Error", statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async getEHRAccessRequestsForDoctor(doctor_id) {
        if (!doctor_id) {
            throw new AppError("doctor_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM ehr_access_request
                WHERE doctor_id = $1`,
                values: [doctor_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No EHR access requests found for this doctor", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`error in getEHRAccessRequestsForDoctor ${error.message}`);
            throw new AppError("Internal Server Error", statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async insertEHRAccessRequest(doctor_id, patient_id) {
        if (!doctor_id) {
            throw new AppError("doctor_id is required", statusCodes.BAD_REQUEST);
        }
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const checkExists = await this.checkEHRAccessRequestExists(doctor_id, patient_id);
            if (checkExists) {
                const updatedRequest = await this.updateEHRAccessRequestStatus(patient_id, checkExists, 're-requested');

                return updatedRequest;
            }

            const query = {
                text: `INSERT INTO ehr_access_request
                (patient_id, doctor_id)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [patient_id, doctor_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to create EHR access request", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`error in insertEHRAccessRequest ${error.message}`);
            throw new AppError("Internal Server Error", statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async updateEHRAccessRequestStatus(patient_id, ehr_access_request_id, status) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!ehr_access_request_id) {
            throw new AppError("ehr_access_request_id is required", statusCodes.BAD_REQUEST);
        }
        if (!status) {
            throw new AppError("status is required", statusCodes.BAD_REQUEST);
        }
        if (!validEHRAccessRequestStatuses.includes(status)) {
            throw new AppError(`Invalid status`, statusCodes.BAD_REQUEST);
        }

        try {
            const checkOwnership = await this.checkEHRAccessRequestOwnership(patient_id, ehr_access_request_id);
            if (!checkOwnership) {
                throw new AppError("You do not have permission to update this EHR access request", statusCodes.FORBIDDEN);
            }

            const query = {
                text: `UPDATE ehr_access_request
                SET status = $1,
                updated_at = CURRENT_TIMESTAMP
                WHERE ehr_access_request_id = $2
                RETURNING *`,
                values: [status, ehr_access_request_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to update EHR access request status", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`error in updateEHRAccessRequestStatus ${error.message}`);
            throw new AppError("Internal Server Error", statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async approveEHRAccessRequest(patient_id, ehr_access_request_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!ehr_access_request_id) {
            throw new AppError("ehr_access_request_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const updatedRequest = await this.updateEHRAccessRequestStatus(patient_id, ehr_access_request_id, 'approved');

            return updatedRequest;
        } catch (error) {
            console.error(`error in approveEHRAccessRequest ${error.message}`);
            throw new AppError("Internal Server Error", statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async denyEHRAccessRequest(patient_id, ehr_access_request_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!ehr_access_request_id) {
            throw new AppError("ehr_access_request_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const updatedRequest = await this.updateEHRAccessRequestStatus(patient_id, ehr_access_request_id, 'denied');

            return updatedRequest;
        } catch (error) {
            console.error(`error in denyEHRAccessRequest ${error.message}`);
            throw new AppError("Internal Server Error", statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async revokeEHRAccessRequest(patient_id, ehr_access_request_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!ehr_access_request_id) {
            throw new AppError("ehr_access_request_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const updatedRequest = await this.updateEHRAccessRequestStatus(patient_id, ehr_access_request_id, 'revoked');

            return updatedRequest;
        } catch (error) {
            console.error(`error in revokeEHRAccessRequest ${error.message}`);
            throw new AppError("Internal Server Error", statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async checkEHRAccessRequestExists(doctor_id, patient_id) {
        if (!doctor_id) {
            throw new AppError("doctor_id is required", statusCodes.BAD_REQUEST);
        }
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM ehr_access_request
                WHERE doctor_id = $1 AND patient_id = $2`,
                values: [doctor_id, patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0].ehr_access_request_id;
        } catch (error) {
            console.error(`error in checkEHRAccessRequestExists ${error.message}`);
            throw new AppError("Internal Server Error", statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async checkEHRAccessRequestOwnership(patient_id, ehr_access_request_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!ehr_access_request_id) {
            throw new AppError("ehr_access_request_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM ehr_access_request
                WHERE patient_id = $1 AND ehr_access_request_id = $2`,
                values: [patient_id, ehr_access_request_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0].ehr_access_request_id;
        } catch (error) {
            console.error(`error in checkEHRAccessRequestOwnership ${error.message}`);
            throw new AppError("Internal Server Error", statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { EHRAccessRequestService };