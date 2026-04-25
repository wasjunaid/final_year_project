const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");

class HospitalPanelListService {
    /**
     * Gets hospital panel list if exists for the hospital staff's hospital.
     * @param {number} person_id - The person ID of the hospital staff.
     * @return {Promise<Array|boolean>} The hospital panel list array or false if none found.
     * @throws {AppError} if any issue occurs
     */
    static async getHospitalPanelListIfExists(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("Hospital staff not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `SELECT * FROM hospital_panel_list_view
                WHERE
                hospital_id = $1`,
                values: [hospitalStaff.hospital_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalPanelListService.getHospitalPanelListIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new hospital panel list entry for the hospital staff's hospital.
     * @param {number} person_id - The person ID of the hospital staff.
     * @param {number} insurance_company_id - The insurance company ID to add to the panel list.
     * @return {Promise<object>} The inserted hospital panel list entry.
     * @throws {AppError} if any issue occurs
     */
    static async insertHospitalPanelList(person_id, insurance_company_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!insurance_company_id) {
                throw new AppError("insurance_company_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("Hospital staff not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `INSERT INTO hospital_panel_list
                (hospital_id, insurance_company_id)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [hospitalStaff.hospital_id, insurance_company_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error inserting hospital panel", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalPanelListService.insertHospitalPanelList: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Hospital panel already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * Deletes a hospital panel list entry for the hospital staff's hospital.
     * @param {number} person_id - The person ID of the hospital staff.
     * @param {number} hospital_panel_list_id - The hospital panel list ID to delete.
     * @return {Promise<object>} The deleted hospital panel list entry.
     * @throws {AppError} if any issue occurs
     */
    static async deleteHospitalPanelList(person_id, hospital_panel_list_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!hospital_panel_list_id) {
                throw new AppError("hospital_panel_list_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("Hospital staff not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `DELETE FROM hospital_panel_list
                WHERE
                hospital_panel_list_id = $1 AND hospital_id = $2`,
                values: [hospital_panel_list_id, hospitalStaff.hospital_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error deleting hospital panel", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalPanelListService.deleteHospitalPanelList: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { HospitalPanelListService };