const { pool } = require("../../config/databaseConfig");
const { validHospitalAssocaitionRequestRoles } = require("../../database/hospital/hospitalAssociationRequestTableQuery");
const { PersonService } = require("../Person/PersonService");
const { DoctorService } = require("../Doctor/DoctorService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class HospitalAssociationRequestService {
    static async getHospitalAssociationRequests(hospital_id) {
        if (!hospital_id) {
            throw new AppError("hospital_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM hospital_association_request
                WHERE
                hospital_id = $1`,
                values: [hospital_id]
            }
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No hospital association requests found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting hospital association requests: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertHospitalAssociationRequest(hospital_id, email, role) {
        if (!hospital_id) {
            throw new AppError("hospital_id is required", statusCodes.BAD_REQUEST);
        }
        if (!email) {
            throw new AppError("email is required", statusCodes.BAD_REQUEST);
        }
        if (!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }
        if (!validHospitalAssocaitionRequestRoles.includes(role)) {
            throw new AppError(`Invalid role`, statusCodes.BAD_REQUEST);
        }

        try {
            const checkExists = await PersonService.checkEmailInUse(email);
            if (!checkExists) {
                throw new AppError("No person found with the provided email", statusCodes.NOT_FOUND);
            }
            const person = await PersonService.getPersonByEmail(email);
            if (role === 'doctor') {
                const doctor = await DoctorService.getDoctor(person.person_id);
                if (doctor.hospital_id) {
                    throw new AppError("Doctor is already associated with a hospital", statusCodes.CONFLICT);
                }
            } else if (role === 'medical coder') {
                // Add medical coder specific checks here if needed
            }

            const query = {
                text: `INSERT INTO hospital_association_request
                (hospital_id, person_id, role)
                VALUES
                ($1, $2, $3)
                RETURNING *`,
                values: [hospital_id, person.person_id, role]
            }
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error inserting hospital association request", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting hospital association request: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deleteHospitalAssociationRequest(hospital_association_request_id) {
        if (!hospital_association_request_id) {
            throw new AppError("hospital_association_request_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM hospital_association_request
                WHERE
                hospital_association_request_id = $1
                RETURNING *`,
                values: [hospital_association_request_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error deleting hospital association request", statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            console.error(`Error deleting hospital association request: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deleteHospitalAssociationRequestsByPersonIDAndRole(person_id, role) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }
        if (!validHospitalAssocaitionRequestRoles.includes(role)) {
            throw new AppError(`Invalid role`, statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM hospital_association_request
                WHERE
                person_id = $1 AND role = $2
                RETURNING *`,
                values: [person_id, role]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error deleting hospital association requests", statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            console.error(`Error deleting hospital association requests by person_id: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async acceptHospitalAssociationRequest(hospital_association_request_id) {
        if (!hospital_association_request_id) {
            throw new AppError("hospital_association_request_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const checkExists = await this.checkHospitalAssociationRequestExists(hospital_association_request_id);
            if (!checkExists) {
                throw new AppError("No hospital association request found with the provided id", statusCodes.NOT_FOUND);
            }

            if (checkExists.role === 'doctor') {
                await DoctorService.updateDoctorHospital(checkExists.person_id, checkExists.hospital_id);
            } else if (checkExists.role === 'medical coder') {
                // Add medical coder specific association logic here if needed
            }

            await this.deleteHospitalAssociationRequestsByPersonIDAndRole(checkExists.person_id, checkExists.role);
        } catch (error) {
            console.error(`Error accepting hospital association request: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkHospitalAssociationRequestExists(hospital_association_request_id) {
        if (!hospital_association_request_id) {
            throw new AppError("hospital_association_request_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM hospital_association_request
                WHERE
                hospital_association_request_id = $1`,
                values: [hospital_association_request_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error checking hospital association request existence: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { HospitalAssociationRequestService };