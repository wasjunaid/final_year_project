const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");
const axios = require("axios");
const {
    PROJECT_BACKEND_BASE_URL,
    PROJECT_BACKEND_INSERT_INSURANCE_COMPANY_ENDPOINT,
    PROJECT_BACKEND_UPDATE_INSURANCE_COMPANY_ENDPOINT,
    INTERSYSTEM_SYNC_SECRET,
} = require("../../config/projectBackendConfig");

class InsuranceCompanyService {
    /**
     * gets all insurance companies if exists
     * @returns {Promise<Array|boolean>} Returns array of insurance companies if exists, otherwise false
     * @throws {AppError} Throws error if any issue occurs during the process
     */
    static async getInsuranceCompaniesIfExists() {
        try {
            const query = {
                text: `SELECT * FROM insurance_company`
            }
            const result = await DatabaseService.query(query.text);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in InsuranceCompanyService.getInsuranceCompaniesIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * inserts a new insurance company
     * @param {string} name - name of the insurance company
     * @returns {Promise<Object>} Returns the inserted insurance company object
     * @throws {AppError} Throws error if any issue occurs during the process
     */
    static async insertInsuranceCompany({
        name,
        focal_person_name = null,
        focal_person_email = null,
        focal_person_phone = null,
        address = null,
    }) {
        try {
            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }
            
            name = name.trim().toLowerCase();

            const query = {
                text: `INSERT INTO insurance_company
                (name, focal_person_name, focal_person_email, focal_person_phone, address)
                VALUES
                ($1, $2, $3, $4, $5)
                RETURNING *`,
                values: [name, focal_person_name, focal_person_email, focal_person_phone, address]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert insurance company", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            await axios.post(
                `${PROJECT_BACKEND_BASE_URL}${PROJECT_BACKEND_INSERT_INSURANCE_COMPANY_ENDPOINT}`,
                {
                    insurance_company_id: result.rows[0].insurance_company_id,
                    name: result.rows[0].name,
                    focal_person_name: result.rows[0].focal_person_name,
                    focal_person_email: result.rows[0].focal_person_email,
                    focal_person_phone: result.rows[0].focal_person_phone,
                    address: result.rows[0].address,
                    wallet_address: result.rows[0].wallet_address,
                },
                {
                    headers: {
                        "x-sync-secret": INTERSYSTEM_SYNC_SECRET,
                    },
                }
            );

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsuranceCompanyService.insertInsuranceCompany: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Insurance company already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * updates an existing insurance company
     * @param {number} insurance_company_id - ID of the insurance company
     * @param {string} name - new name of the insurance company
     * @returns {Promise<Object>} Returns the updated insurance company object
     * @throws {AppError} Throws error if any issue occurs during the process
     */
    static async updateInsuranceCompany({
        insurance_company_id,
        name,
        wallet_address,
        focal_person_name = null,
        focal_person_email = null,
        focal_person_phone = null,
        address = null,
    }) {
        try {
            if (!insurance_company_id) {
                throw new AppError("insurance_company_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            name = name.trim().toLowerCase();

            if (name.length === 0) {
                throw new AppError("name cannot be empty or whitespace", STATUS_CODES.BAD_REQUEST);
            }

            if (!wallet_address) {
                throw new AppError("wallet_address is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof wallet_address !== 'string') {
                throw new AppError("wallet_address must be a string", STATUS_CODES.BAD_REQUEST);
            }

            wallet_address = wallet_address.trim();

            if (wallet_address.length === 0) {
                throw new AppError("wallet_address cannot be empty or whitespace", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `UPDATE insurance_company
                SET
                name = $1,
                wallet_address = $2,
                focal_person_name = $3,
                focal_person_email = $4,
                focal_person_phone = $5,
                address = $6
                WHERE
                insurance_company_id = $7
                RETURNING *`,
                values: [name, wallet_address, focal_person_name, focal_person_email, focal_person_phone, address, insurance_company_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Insurance company not found", STATUS_CODES.NOT_FOUND);
            }

            await axios.put(
                `${PROJECT_BACKEND_BASE_URL}${PROJECT_BACKEND_UPDATE_INSURANCE_COMPANY_ENDPOINT}/${insurance_company_id}`,
                {
                    name: result.rows[0].name,
                    focal_person_name: result.rows[0].focal_person_name,
                    focal_person_email: result.rows[0].focal_person_email,
                    focal_person_phone: result.rows[0].focal_person_phone,
                    address: result.rows[0].address,
                    wallet_address: result.rows[0].wallet_address,
                },
                {
                    headers: {
                        "x-sync-secret": INTERSYSTEM_SYNC_SECRET,
                    },
                }
            );

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsuranceCompanyService.updateInsuranceCompany: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Insurance company with this name already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * deletes an existing insurance company
     * @param {number} insurance_company_id - ID of the insurance company
     * @returns {Promise<Object>} Returns the deleted insurance company object
     * @throws {AppError} Throws error if any issue occurs during the process
     */
    static async deleteInsuranceCompany(insurance_company_id) {
        try {
            if (!insurance_company_id) {
                throw new AppError("insurance_company_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `DELETE FROM insurance_company
                WHERE
                insurance_company_id = $1
                RETURNING *`,
                values: [insurance_company_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Insurance company not found", STATUS_CODES.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsuranceCompanyService.deleteInsuranceCompany: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { InsuranceCompanyService };