const { pool } = require("../../config/databaseConfig");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class HospitalPanelListService {
    static async getHospitalPanelList(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const hospitalStaff = await HospitalStaffService.checkHospitalStaffExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("Hospital staff not found", statusCodes.NOT_FOUND);
            }
            if (hospitalStaff.role !== 'hospital admin' && hospitalStaff.role !== 'hospital sub admin') {
                throw new AppError("Unauthorized access", statusCodes.UNAUTHORIZED);
            }

            const query = {
                text: `SELECT * FROM hospital_panel_list
                WHERE
                hospital_id = $1`,
                values: [hospitalStaff.hospital_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No hospital panel found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting hospital panel list: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertHospitalPanelList(person_id, insurance_company_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!insurance_company_id) {
            throw new AppError("insurance_company_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const hospitalStaff = await HospitalStaffService.checkHospitalStaffExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("Hospital staff not found", statusCodes.NOT_FOUND);
            }
            if (hospitalStaff.role !== 'hospital admin' && hospitalStaff.role !== 'hospital sub admin') {
                throw new AppError("Unauthorized access", statusCodes.UNAUTHORIZED);
            }

            const query = {
                text: `INSERT INTO hospital_panel_list
                (hospital_id, insurance_company_id)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [hospitalStaff.hospital_id, insurance_company_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error inserting hospital panel", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting hospital panel: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deleteHospitalPanelList(person_id, hospital_panel_list_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!hospital_panel_list_id) {
            throw new AppError("hospital_panel_list_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const hospitalStaff = await HospitalStaffService.checkHospitalStaffExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("Hospital staff not found", statusCodes.NOT_FOUND);
            }
            if (hospitalStaff.role !== 'hospital admin' && hospitalStaff.role !== 'hospital sub admin') {
                throw new AppError("Unauthorized access", statusCodes.UNAUTHORIZED);
            }

            const query = {
                text: `DELETE FROM hospital_panel_list
                WHERE
                hospital_panel_list_id = $1 AND hospital_id = $2`,
                values: [hospital_panel_list_id, hospitalStaff.hospital_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error deleting hospital panel", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error deleting hospital panel: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { HospitalPanelListService };