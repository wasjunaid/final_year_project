const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");

class InsuranceCompanyService {
    /**
     * Fetches an insurance company by its ID
     * @param {number} insurance_company_id - ID of the insurance company
     * @returns {Promise<Object|boolean>} - The insurance company object if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getInsuranceCompanyIfExists(insurance_company_id) {
        try {
            if (!insurance_company_id) {
                throw new AppError("insurance_company_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM insurance_company
                WHERE
                insurance_company_id = $1`,
                values: [insurance_company_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsuranceCompanyService.getInsuranceCompanyIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all insurance companies from the database
     * @returns {Promise<Array>} list of all insurance companies
     * @throws {AppError} if any issue occurs
     */
    static async getAllInsuranceCompaniesIfExists() {
        try {
            const query = {
                text: `SELECT * FROM insurance_company`
            };
            const result = await DatabaseService.query(query.text);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in InsuranceCompanyService.getAllInsuranceCompanies: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new insurance company into the database
     * @param {string} name - name of the insurance company
     * @returns {Promise<Object>} - The newly created insurance company object.
     * @throws {AppError} if any issue occurs
     */
    static async insertInsuranceCompany({
        name,
        insurance_company_id = null,
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

            if (typeof name !== 'string') {
                throw new AppError("name must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO insurance_company
                (name, focal_person_name, focal_person_email, focal_person_phone, address, wallet_address)
                VALUES
                ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                values: [name, focal_person_name, focal_person_email, focal_person_phone, address, wallet_address]
            };
            if (insurance_company_id !== null) {
                query.text = `INSERT INTO insurance_company
                (insurance_company_id, name, focal_person_name, focal_person_email, focal_person_phone, address, wallet_address)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`;
                query.values = [
                    insurance_company_id,
                    name,
                    focal_person_name,
                    focal_person_email,
                    focal_person_phone,
                    address,
                    wallet_address,
                ];
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error inserting insurance company", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

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
     * Updates an existing insurance company in the database
     * @param {Object} params - Object containing insurance_company_id and name
     * @param {number} params.insurance_company_id - ID of the insurance company to update
     * @param {string} params.name - New name for the insurance company
     * @returns {Promise<Object>} the updated insurance company
     * @throws {AppError} if any issue occurs
     */
    static async updateInsuranceCompany({
        insurance_company_id,
        name,
        focal_person_name = null,
        focal_person_email = null,
        focal_person_phone = null,
        address = null,
        wallet_address = null,
    }) {
        try {
            if (!insurance_company_id) {
                throw new AppError("insurance_company_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof name !== 'string') {
                throw new AppError("name must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `UPDATE insurance_company
                SET name = $1,
                focal_person_name = $2,
                focal_person_email = $3,
                focal_person_phone = $4,
                address = $5,
                wallet_address = $6
                WHERE
                insurance_company_id = $7
                RETURNING *`,
                values: [name, focal_person_name, focal_person_email, focal_person_phone, address, wallet_address, insurance_company_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error updating insurance company", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsuranceCompanyService.updateInsuranceCompany: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Insurance company with this name already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }
}

module.exports = { InsuranceCompanyService };