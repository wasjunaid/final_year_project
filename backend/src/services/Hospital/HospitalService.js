const { pool } = require("../../config/databaseConfig");
const { AddressService } = require("../Address/AddressService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class HospitalService {
    static async getHospitals() {
        try {
            const query = {
                text: `SELECT * FROM hospital
                JOIN address ON hospital.address_id = address.address_id`,
            };
            const result = await pool.query(query);

            return result.rows;
        } catch (error) {
            console.error(`Error getting hospitals: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertHospital(name, address) {
        if (!name) {
            throw new AppError("name is required", statusCodes.BAD_REQUEST);
        }
        if (!address) {
            throw new AppError("address is required", statusCodes.BAD_REQUEST);
        }

        try {
            const checkExists = await this.checkHospitalExists(name, address);
            if (checkExists) {
                throw new AppError("Hospital with this name and address already exists", statusCodes.CONFLICT);
            }

            const addressDetail = await AddressService.updateAddress(address);

            const insertQuery = {
                text: `INSERT INTO hospital
                (name, address_id)
                VALUES ($1, $2)
                RETURNING *`,
                values: [name, addressDetail.address_id]
            };
            const result = await pool.query(insertQuery);
            if (!result.rows[0]) {
                throw new AppError("Error inserting hospital", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting hospitals: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updateHospital(hospital_id, name, address) {
        if (!hospital_id) {
            throw new AppError("hospital_id is required", statusCodes.BAD_REQUEST);
        }
        if (!name) {
            throw new AppError("name is required", statusCodes.BAD_REQUEST);
        }
        if (!address) {
            throw new AppError("address is required", statusCodes.BAD_REQUEST);
        }

        try {
            const checkExists = await this.checkHospitalExists(name, address);
            if (checkExists) {
                throw new AppError("Hospital with this name and address already exists", statusCodes.CONFLICT);
            }

            const addressDetail = await AddressService.updateAddress(address);

            const query = {
                text: `UPDATE hospital
                SET name = $1,
                address_id = $2,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                hospital_id = $3
                RETURNING *`,
                values: [name, addressDetail.address_id, hospital_id]
            };
            const result = await pool.query(query);
            if (!result.rows[0]) {
                throw new AppError("Error updating hospital", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating hospital: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deleteHospital(hospital_id) {
        if (!hospital_id) {
            throw new AppError("hospital_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM hospital
                WHERE
                hospital_id = $1`,
                values: [hospital_id]
            };
            const result = await pool.query(query);
            if (result.rowCount === 0) {
                throw new AppError("Error deleting hospital", statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            console.error(`Error deleting hospital: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkHospitalExists(name, address) {
        if (!name) {
            throw new AppError("name is required", statusCodes.BAD_REQUEST);
        }
        if (!address) {
            throw new AppError("address is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM hospital h
                JOIN address a ON h.address_id = a.address_id
                WHERE h.name = $1 AND a.address = $2`,
                values: [name, address]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Error checking hospital exists: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { HospitalService };