const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");

class HospitalService {
    /**
     * Get a hospital by ID if it exists
     * @param {number} hospital_id - ID of the hospital
     * @returns {Promise<Object|boolean>} - Hospital object or false if not found
     * @throws {AppError} - if hospital_id is not provided
     */
    static async getHospitalIfExists(hospital_id) {
        try {
            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM hospital
                WHERE
                hospital_id = $1`,
                values: [hospital_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalService.getHospitalIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Get all hospitals if they exist
     * @returns {Promise<Array|boolean>} - Array of hospitals or false if none exist
     * @throws {AppError} - if database query fails
     */
    static async getHospitalsIfExists() {
        try {
            const query = {
                text: `SELECT * FROM hospital`
            }
            const result = await DatabaseService.query(query);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalService.getHospitalsIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * insert a new hospital
     * @param {string} name - name of the hospital
     * @returns {Promise<Object>} - inserted hospital object
     * @throws {AppError} - if name is not provided or insertion fails
     */
    static async insertHospital({
        name,
        hospital_id = null,
        focal_person_name = null,
        focal_person_email = null,
        focal_person_phone = null,
        address = null,
        wallet_address = null,
    }) {
        try {
            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            name = name.trim().toLowerCase();

            const query = {
                text: `INSERT INTO hospital
                (name, focal_person_name, focal_person_email, focal_person_phone, address, wallet_address)
                VALUES
                ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                values: [name, focal_person_name, focal_person_email, focal_person_phone, address, wallet_address]
            }
            if (hospital_id !== null) {
                query.text = `INSERT INTO hospital
                (hospital_id, name, focal_person_name, focal_person_email, focal_person_phone, address, wallet_address)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`;
                query.values = [hospital_id, name, focal_person_name, focal_person_email, focal_person_phone, address, wallet_address];
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert hospital", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalService.insertHospital: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Hospital already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * update an existing hospital
     * @param {number} hospital_id - ID of the hospital to update
     * @param {string} name - new name of the hospital
     * @returns {Promise<Object>} - updated hospital object
     * @throws {AppError} - if hospital_id or name is not provided or update fails
     */
    static async updateHospital({
        hospital_id,
        name,
        focal_person_name = null,
        focal_person_email = null,
        focal_person_phone = null,
        address = null,
        wallet_address = null,
    }) {
        try {
            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            name = name.trim().toLowerCase();

            const query = {
                text: `UPDATE hospital
                SET
                name = $1,
                focal_person_name = $2,
                focal_person_email = $3,
                focal_person_phone = $4,
                address = $5,
                wallet_address = $6
                WHERE
                hospital_id = $7
                RETURNING *`,
                values: [name, focal_person_name, focal_person_email, focal_person_phone, address, wallet_address, hospital_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Hospital not found", STATUS_CODES.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalService.updateHospital: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Hospital with this name already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * delete an existing hospital
     * @param {number} hospital_id - ID of the hospital to delete
     * @returns {Promise<boolean>} - true if deletion was successful
     * @throws {AppError} - if hospital_id is not provided or deletion fails
     */
    static async deleteHospital(hospital_id) {
        try {
            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `DELETE FROM hospital
                WHERE
                hospital_id = $1
                RETURNING *`,
                values: [hospital_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Hospital not found", STATUS_CODES.NOT_FOUND);
            }

            return true;
        } catch (error) {
            console.error(`Error in HospitalService.deleteHospital: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { HospitalService };