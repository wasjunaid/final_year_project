const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { InsuranceStaffService } = require("./InsuranceStaffService");
const { HospitalService } = require("../Hospital/HospitalService");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");

class InsurancePanelListService {
    /**
     * Get insurance panel list for an insurance company if they exist
     * @param {number} user_id - ID of the insurance staff user
     * @returns {Promise<Array|boolean>} - Array of insurance panels or false if none exist
     * @throws {AppError} - if user_id is not provided
     */
    static async getInsurancePanelListIfExists(user_id) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }
            
            const query = {
                text: `SELECT * FROM insurance_panel_list_view
                WHERE
                insurance_company_id = $1`,
                values: [staff.insurance_company_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in InsurancePanelListService.getInsurancePanelListIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Get insurance panel list for an insurance company
     * @param {number} user_id - ID of the insurance staff user
     * @returns {Promise<Array>} - Array of insurance panels
     * @throws {AppError} - if user_id is not provided or no panels found
     */
    static async insertInsurancePanelList(user_id, hospital_id) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            const hospital = await HospitalService.getHospitalIfExists(hospital_id);
            if (!hospital) {
                throw new AppError("Hospital not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `INSERT INTO insurance_panel_list
                (hospital_id, insurance_company_id)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [hospital_id, staff.insurance_company_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert insurance panel", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsurancePanelListService.insertInsurancePanelList: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Insurance panel already exists", STATUS_CODES.CONFLICT);
            }
            
            throw error;
        }
    }

    /**
     * Delete an insurance panel from the list
     * @param {number} user_id - ID of the insurance staff user
     * @param {number} insurance_panel_list_id - ID of the insurance panel list entry to delete
     * @returns {Promise<boolean>} - true if deletion was successful
     * @throws {AppError} - if user_id or insurance_panel_list_id is not provided or deletion fails
     */
    static async deleteInsurancePanelList(user_id, insurance_panel_list_id) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!insurance_panel_list_id) {
                throw new AppError("insurance_panel_list_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `DELETE FROM insurance_panel_list
                WHERE
                insurance_panel_list_id = $1 AND insurance_company_id = $2`,
                values: [insurance_panel_list_id, staff.insurance_company_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to delete insurance panel", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in InsurancePanelListService.deleteInsurancePanelList: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { InsurancePanelListService };