const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");
const { DoctorService } = require("../Doctor/DoctorService");

class LabTestService {
    /**
     * Fetches a lab test by its ID and hospital ID.
     * @param {number} lab_test_id - The ID of the lab test.
     * @param {number} hospital_id - The ID of the hospital.
     * @returns {Promise<object|boolean>} The lab test object or false if not found.
     * @throws {AppError} if any issue occurs
     */
    static async getLabTestIfExists(lab_test_id, hospital_id) {
        try {
            if (!lab_test_id) {
                throw new AppError("lab_test_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM lab_test
                WHERE
                lab_test_id = $1 AND hospital_id = $2`,
                values: [lab_test_id, hospital_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in LabTestService.getLabTestIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all lab tests for the hospital associated with the given person_id.
     * @param {number} person_id - The ID of the person (hospital staff).
     * @returns {Promise<Array|boolean>} Array of lab tests or false if none found.
     * @throws {AppError} if any issue occurs
     */
    static async getAllLabTestsIfExists(person_id, role) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            let staff = null;
            if (role !== roles.DOCTOR) {
                staff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
                if (!staff) {
                    throw new AppError("Hospital staff not found", STATUS_CODES.NOT_FOUND);
                }
            } else {
                staff = await DoctorService.getDoctorIfExists(person_id);
                if (!staff) {
                    throw new AppError("Doctor not found", STATUS_CODES.NOT_FOUND);
                }
            }

            const query = {
                text: `SELECT * FROM lab_test
                WHERE
                hospital_id = $1`,
                values: [staff.hospital_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in LabTestService.getAllLabTestsIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new lab test into the database.
     * @param {object} params - Object containing person_id, name, description, and cost.
     * @param {number} params.person_id - The ID of the person (hospital staff).
     * @param {string} params.name - The name of the lab test.
     * @param {string} params.description - The description of the lab test.
     * @param {number} params.cost - The cost of the lab test.
     * @returns {Promise<object>} The inserted lab test object.
     * @throws {AppError} if any issue occurs
     */
    static async insertLabTest({person_id, name, description, cost}) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof name !== 'string') {
                throw new AppError("name must be a string", STATUS_CODES.BAD_REQUEST);
            }

            name = name.trim().toLowerCase();
            
            if (name.length === 0) {
                throw new AppError("name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!description) {
                throw new AppError("description is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof description !== 'string') {
                throw new AppError("description must be a string", STATUS_CODES.BAD_REQUEST);
            }

            description = description.trim();

            if (description.length === 0) {
                throw new AppError("description cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (cost === null || isNaN(cost) || cost < 0) {
                throw new AppError("cost must be a non-negative number", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!staff) {
                throw new AppError("Hospital staff not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `INSERT INTO lab_test
                (hospital_id, name, description, cost)
                VALUES
                ($1, $2, $3, $4)
                RETURNING *`,
                values: [staff.hospital_id, name, description, cost],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert lab test", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in LabTestService.insertLabTestIfNotExists: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Lab test with this name already exists in the hospital", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * Updates an existing lab test in the database.
     * @param {object} params - Object containing person_id, lab_test_id, name, description, and cost.
     * @param {number} params.person_id - The ID of the person (hospital staff).
     * @param {number} params.lab_test_id - The ID of the lab test to update.
     * @param {string} params.name - The new name of the lab test.
     * @param {string} params.description - The new description of the lab test.
     * @param {number} params.cost - The new cost of the lab test.
     * @returns {Promise<object>} The updated lab test object.
     * @throws {AppError} if any issue occurs
     */
    static async updateLabTest({person_id, lab_test_id, name, description, cost}) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!lab_test_id) {
                throw new AppError("lab_test_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            name = name.trim().toLowerCase();

            if (name.length === 0) {
                throw new AppError("name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!description) {
                throw new AppError("description is required", STATUS_CODES.BAD_REQUEST);
            }

            description = description.trim();

            if (description.length === 0) {
                throw new AppError("description cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (cost === null || (isNaN(cost) || cost < 0)) {
                throw new AppError("cost must be a non-negative number", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!staff) {
                throw new AppError("Hospital staff not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `UPDATE lab_test
                SET
                name = $1,
                description = $2,
                cost = $3
                WHERE
                lab_test_id = $4 AND hospital_id = $5
                RETURNING *`,
                values: [name, description, cost, lab_test_id, staff.hospital_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Lab test not found or no changes made", STATUS_CODES.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating lab tests: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Lab test with this name already exists in the hospital", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }
}

module.exports = { LabTestService };