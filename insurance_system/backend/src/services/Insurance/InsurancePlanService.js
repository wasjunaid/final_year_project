const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { InsuranceStaffService } = require("./InsuranceStaffService");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");

class InsurancePlanService {
    /**
     * get an insurance plan by its id
     * @param {number} insurance_plan_id id of the insurance plan
     * @returns {Promise<Object|boolean>} insurance plan object or false if not found
     * @throws {AppError} if insurance_plan_id is not provided or on database errors
     */
    static async getInsurancePlanIfExists(insurance_plan_id) {
        try {
            if (!insurance_plan_id) {
                throw new AppError("insurance_plan_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM insurance_plan
                WHERE
                insurance_plan_id = $1`,
                values: [insurance_plan_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        }
        catch (error) {
            console.error(`Error in InsurancePlanService.getInsurancePlanIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * get insurance plans for the insurance company of the insurance staff
     * @param {number} user_id id of the insurance staff
     * @returns {Promise<Array|boolean>} array of insurance plans or false if no plans found
     * @throws {AppError} if user_id is not provided or user is not an insurance staff
     */
    static async getInsurancePlansIfExists(user_id) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("User is not an insurance staff", STATUS_CODES.FORBIDDEN);
            }

            const query = {
                text: `SELECT * FROM insurance_plan
                WHERE
                insurance_company_id = $1`,
                values: [staff.insurance_company_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in InsurancePlanService.getInsurancePlansIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * insert a new insurance plan for the insurance company of the insurance staff
     * @param {Object} params parameters object
     * @param {number} params.user_id id of the insurance staff
     * @param {string} params.name name of the insurance plan
     * @param {string} params.description description of the insurance plan
     * @param {number} params.coverage_amount coverage amount of the insurance plan
     * @param {number} params.number_of_persons number of persons covered by the insurance plan
     * @returns {Promise<Object>} inserted insurance plan
     * @throws {AppError} if any required parameter is missing or user is not an insurance staff
     */
    static async insertInsurancePlan({ user_id, name, description, coverage_amount, number_of_persons }) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }
            
            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            name = name.trim().toLowerCase();

            if (!description) {
                throw new AppError("description is required", STATUS_CODES.BAD_REQUEST);
            }

            description = description.trim().toLowerCase();

            if (!coverage_amount || isNaN(coverage_amount) || coverage_amount <= 0) {
                throw new AppError("coverage_amount is required and must be a positive number", STATUS_CODES.BAD_REQUEST);
            }

            if (!number_of_persons || isNaN(number_of_persons) || number_of_persons <= 0) {
                throw new AppError("number_of_persons is required and must be a positive integer", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("User is not an insurance staff", STATUS_CODES.FORBIDDEN);
            }

            const query = {
                text: `INSERT INTO insurance_plan
                (name, description, coverage_amount, number_of_persons, insurance_company_id)
                VALUES
                ($1, $2, $3, $4, $5)
                RETURNING *`,
                values: [name, description, coverage_amount, number_of_persons, staff.insurance_company_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to create insurance plan", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsurancePlanService.insertInsurancePlan: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Insurance plan with the same name, coverage and number of persons already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * update an existing insurance plan for the insurance company of the insurance staff
     * @param {Object} params parameters object
     * @param {number} params.user_id id of the insurance staff
     * @param {number} params.insurance_plan_id id of the insurance plan to update
     * @param {string} params.name name of the insurance plan
     * @param {string} params.description description of the insurance plan
     * @param {number} params.coverage_amount coverage amount of the insurance plan
     * @param {number} params.number_of_persons number of persons covered by the insurance plan
     * @returns {Promise<Object>} updated insurance plan
     * @throws {AppError} if any required parameter is missing or user is not an insurance staff
     */
    static async updateInsurancePlan({ user_id, insurance_plan_id, name, description, coverage_amount, number_of_persons }) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!insurance_plan_id) {
                throw new AppError("insurance_plan_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            name = name.trim().toLowerCase();

            if (!description) {
                throw new AppError("description is required", STATUS_CODES.BAD_REQUEST);
            }

            description = description.trim().toLowerCase();

            if (!coverage_amount || isNaN(coverage_amount) || coverage_amount <= 0) {
                throw new AppError("coverage_amount is required and must be a positive number", STATUS_CODES.BAD_REQUEST);
            }

            if (!number_of_persons || isNaN(number_of_persons) || number_of_persons <= 0) {
                throw new AppError("number_of_persons is required and must be a positive integer", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("User is not an insurance staff", STATUS_CODES.FORBIDDEN);
            }

            const query = {
                text: `UPDATE insurance_plan
                SET
                name = $1,
                description = $2,
                coverage_amount = $3,
                number_of_persons = $4
                WHERE
                insurance_plan_id = $5 AND insurance_company_id = $6
                `,
                values: [name, description, coverage_amount, number_of_persons, insurance_plan_id, staff.insurance_company_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to update insurance plan", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsurancePlanService.updateInsurancePlan: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Insurance plan with the same name, coverage and number of persons already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * delete an existing insurance plan for the insurance company of the insurance staff
     * @param {number} user_id id of the insurance staff
     * @param {number} insurance_plan_id id of the insurance plan to delete
     * @returns {Promise<boolean>} true if deletion was successful
     * @throws {AppError} if any required parameter is missing or user is not an insurance staff
     */
    static async deleteInsurancePlan(user_id, insurance_plan_id) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!insurance_plan_id) {
                throw new AppError("insurance_plan_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("User is not an insurance staff", STATUS_CODES.FORBIDDEN);
            }

            const query = {
                text: `DELETE FROM insurance_plan
                WHERE
                insurance_plan_id = $1 AND insurance_company_id = $2`,
                values: [insurance_plan_id, staff.insurance_company_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to delete insurance plan", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in InsurancePlanService.deleteInsurancePlan: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { InsurancePlanService };