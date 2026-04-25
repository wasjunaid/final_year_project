const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { InsuranceStaffService } = require("./InsuranceStaffService");
const { InsurancePlanService } = require("./InsurancePlanService");
const { INSURANCE_NUMBER_MIN_LENGTH, INSURANCE_NUMBER_MAX_LENGTH } = require("../../utils/validConstantsUtil");

class InsuranceService {
    static async getInsuranceIfExists(insurance_number) {
        try {
            if (!insurance_number) {
                throw new AppError("Insurance number is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM insurance_view WHERE insurance_number = $1`,
                values: [insurance_number],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsuranceService.getInsuranceIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Get all insurances for a specific user if they exist
     * @param {number} user_id - The ID of the user
     * @returns {Promise<Array|boolean>} - Array of insurances or false if none exist
     * @throws {AppError} - Throws error if user_id is not provided or on database errors
     */
    static async getInsurancesIfExists(user_id) {
        try {
            if (!user_id) {
                throw new AppError("User ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `SELECT * FROM insurance_view
                WHERE
                insurance_company_id = $1`,
                values: [staff.insurance_company_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in InsuranceService.getInsurancesIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Insert a new insurance
     * @param {object} params - The parameters for inserting insurance
     * @param {number} params.user_id - The ID of the user
     * @param {string} params.insurance_number - The insurance number
     * @param {number} params.insurance_plan_id - The insurance plan ID
     * @param {string} params.policy_holder_name - The name of the policy holder
     * @param {string} params.start_date - The start date of the insurance
     * @param {string} params.end_date - The end date of the insurance
     * @returns {Promise<object>} - The inserted insurance record
     * @throws {AppError} - Throws error if required parameters are missing or on database errors
     */    
    static async insertInsurance({ user_id, insurance_number, insurance_plan_id, policy_holder_name, start_date, end_date }) {
        try {
            if (!user_id) {
                throw new AppError("User ID is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_number) {
                throw new AppError("Insurance number is required", STATUS_CODES.BAD_REQUEST);
            }

            insurance_number = insurance_number.trim();

            if (insurance_number.length < INSURANCE_NUMBER_MIN_LENGTH || insurance_number.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`Insurance number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_plan_id) {
                throw new AppError("Insurance plan ID is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!policy_holder_name) {
                throw new AppError("Policy holder name is required", STATUS_CODES.BAD_REQUEST);
            }

            policy_holder_name = policy_holder_name.trim().toLowerCase();

            if (policy_holder_name.length === 0) {
                throw new AppError("Policy holder name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!start_date) {
                throw new AppError("Start date is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!end_date) {
                throw new AppError("End date is required", STATUS_CODES.BAD_REQUEST);
            }

            if (new Date(end_date) <= new Date(start_date)) {
                throw new AppError("End date must be after start date", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            const plan = await InsurancePlanService.getInsurancePlanIfExists(insurance_plan_id);
            if (!plan) {
                throw new AppError("Insurance plan not found", STATUS_CODES.NOT_FOUND);
            }

            if (plan.insurance_company_id !== staff.insurance_company_id) {
                throw new AppError("Insurance plan does not belong to the staff's insurance company", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO insurance
                (insurance_number, insurance_plan_id, policy_holder_name, start_date, end_date, amount_remaining)
                VALUES
                ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                values: [insurance_number, insurance_plan_id, policy_holder_name, start_date, end_date, plan.coverage_amount],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert insurance", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsuranceService.insertInsurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Update an existing insurance
     * @param {object} params - The parameters for updating insurance
     * @param {number} params.user_id - The ID of the user
     * @param {string} params.insurance_number - The insurance number
     * @param {number} params.insurance_plan_id - The insurance plan ID
     * @param {string} params.policy_holder_name - The name of the policy holder
     * @param {string} params.start_date - The start date of the insurance
     * @param {string} params.end_date - The end date of the insurance
     * @param {number} params.amount_remaining - The amount remaining in the insurance
     * @returns {Promise<object>} - The updated insurance record
     * @throws {AppError} - Throws error if required parameters are missing or on database errors
     */
    static async updateInsurance({ user_id, insurance_number, insurance_plan_id, policy_holder_name, start_date, end_date, amount_remaining }) {
        try {
            if (!user_id) {
                throw new AppError("User ID is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_number) {
                throw new AppError("Insurance number is required", STATUS_CODES.BAD_REQUEST);
            }

            insurance_number = insurance_number.trim();

            if (insurance_number.length < INSURANCE_NUMBER_MIN_LENGTH || insurance_number.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`Insurance number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_plan_id) {
                throw new AppError("Insurance plan ID is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!policy_holder_name) {
                throw new AppError("Policy holder name is required", STATUS_CODES.BAD_REQUEST);
            }

            policy_holder_name = policy_holder_name.trim().toLowerCase();

            if (policy_holder_name.length === 0) {
                throw new AppError("Policy holder name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!start_date) {
                throw new AppError("Start date is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!end_date) {
                throw new AppError("End date is required", STATUS_CODES.BAD_REQUEST);
            }

            if (new Date(end_date) <= new Date(start_date)) {
                throw new AppError("End date must be after start date", STATUS_CODES.BAD_REQUEST);
            }

            if (!amount_remaining) {
                throw new AppError("Amount remaining is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof amount_remaining !== "number") {
                throw new AppError("Amount remaining must be a number", STATUS_CODES.BAD_REQUEST);
            }

            if (amount_remaining < 0) {
                throw new AppError("Amount remaining cannot be negative", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            const plan = await InsurancePlanService.getInsurancePlanIfExists(insurance_plan_id);
            if (!plan) {
                throw new AppError("Insurance plan not found", STATUS_CODES.NOT_FOUND);
            }

            if (plan.insurance_company_id !== staff.insurance_company_id) {
                throw new AppError("Insurance plan does not belong to the staff's insurance company", STATUS_CODES.BAD_REQUEST);
            }

            if (amount_remaining > plan.coverage_amount) {
                throw new AppError("Amount remaining cannot exceed coverage amount", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `UPDATE insurance
                SET
                insurance_plan_id = $1,
                policy_holder_name = $2,
                start_date = $3,
                end_date = $4,
                amount_remaining = $5
                WHERE
                insurance_number = $6
                RETURNING *`,
                values: [insurance_plan_id, policy_holder_name, start_date, end_date, amount_remaining, insurance_number],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to update insurance", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsuranceService.updateInsurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Delete an insurance by its number
     * @param {number} user_id - The ID of the user
     * @param {string} insurance_number - The insurance number to delete
     * @returns {Promise<boolean>} - Returns false if deletion is successful
     * @throws {AppError} - Throws error if user_id or insurance_number is not provided or on database errors
     */
    static async deleteInsurance(user_id, insurance_number) {
        try {
            if (!user_id) {
                throw new AppError("User ID is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!insurance_number) {
                throw new AppError("Insurance number is required", STATUS_CODES.BAD_REQUEST);
            }

            insurance_number = insurance_number.trim();

            if (insurance_number.length < INSURANCE_NUMBER_MIN_LENGTH || insurance_number.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`Insurance number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `DELETE FROM insurance where insurance_number = $1`,
                values: [insurance_number],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to delete insurance", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return false;
        } catch (error) {
            console.error(`Error in InsuranceService.deleteInsurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Manually renew insurance policy for testing purposes.
     * Resets policy period to one year from now and restores amount_remaining to plan coverage amount.
     */
    static async manualAutoRenewInsurance(user_id, insurance_number) {
        try {
            if (!user_id) {
                throw new AppError("User ID is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_number) {
                throw new AppError("Insurance number is required", STATUS_CODES.BAD_REQUEST);
            }

            insurance_number = insurance_number.trim();

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            const insurance = await this.getInsuranceIfExists(insurance_number);
            if (!insurance) {
                throw new AppError("Insurance policy not found", STATUS_CODES.NOT_FOUND);
            }

            if (Number(insurance.insurance_company_id) !== Number(staff.insurance_company_id)) {
                throw new AppError("You are not authorized to renew this insurance policy", STATUS_CODES.FORBIDDEN);
            }

            const query = {
                text: `UPDATE insurance
                SET
                start_date = CURRENT_TIMESTAMP,
                end_date = CURRENT_TIMESTAMP + INTERVAL '1 year',
                amount_remaining = ip.coverage_amount
                FROM insurance_plan ip
                WHERE insurance.insurance_plan_id = ip.insurance_plan_id
                AND insurance.insurance_number = $1
                RETURNING insurance.*`,
                values: [insurance_number],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to renew insurance policy", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsuranceService.manualAutoRenewInsurance: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { InsuranceService };