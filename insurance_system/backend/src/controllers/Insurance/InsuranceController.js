const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { InsuranceService } = require("../../services/Insurance/InsuranceService");
const { validateID } = require("../../utils/idUtil");
const { INSURANCE_NUMBER_MIN_LENGTH, INSURANCE_NUMBER_MAX_LENGTH } = require('../../utils/validConstantsUtil');

class InsuranceController {
    async getInsurancesIfExists(req, res) {
        try {
            const { user_id } = req.user;

            const insurances = await InsuranceService.getInsurancesIfExists(user_id);
            if (!insurances) {
                // throw new AppError("No insurances found", STATUS_CODES.NOT_FOUND);
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: "No insurances found",
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: insurances,
                message: "Insurances fetched successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceController.getInsurancesIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertInsurance(req, res) {
        try {
            const { user_id } = req.user;
            const { insurance_number, insurance_plan_id, policy_holder_name, start_date, end_date } = req.body;

            if (!insurance_number) {
                throw new AppError("Insurance number is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedInsuranceNumber = insurance_number.trim();
            if (normalizedInsuranceNumber.length < INSURANCE_NUMBER_MIN_LENGTH || normalizedInsuranceNumber.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`Insurance number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_plan_id) {
                throw new AppError("Insurance plan ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPlanID = validateID(insurance_plan_id);
 
            if (!policy_holder_name) {
                throw new AppError("Policy holder name is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedPolicyHolderName = policy_holder_name.trim().toLowerCase();
            if (normalizedPolicyHolderName.length === 0) {
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

            const insurance = await InsuranceService.insertInsurance({
                user_id,
                insurance_number: normalizedInsuranceNumber,
                insurance_plan_id: validatedPlanID,
                policy_holder_name: normalizedPolicyHolderName,
                start_date,
                end_date
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: insurance,
                message: "Insurance created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceController.insertInsurance: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateInsurance(req, res) {
        try {
            const { user_id } = req.user;
            const { insurance_number } = req.params;
            const { insurance_plan_id, policy_holder_name, start_date, end_date, amount_remaining } = req.body;

            if (!insurance_number) {
                throw new AppError("Insurance number is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedInsuranceNumber = insurance_number.trim();
            if (normalizedInsuranceNumber.length < INSURANCE_NUMBER_MIN_LENGTH || normalizedInsuranceNumber.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`Insurance number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_plan_id) {
                throw new AppError("Insurance plan ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPlanID = validateID(insurance_plan_id);

            if (!policy_holder_name) {
                throw new AppError("Policy holder name is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedPolicyHolderName = policy_holder_name.trim().toLowerCase();
            if (normalizedPolicyHolderName.length === 0) {
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

            const insurance = await InsuranceService.updateInsurance({
                user_id,
                insurance_number: normalizedInsuranceNumber,
                insurance_plan_id: validatedPlanID,
                policy_holder_name: normalizedPolicyHolderName,
                start_date,
                end_date,
                amount_remaining
            });

            return res.status(STATUS_CODES.OK).json({
                data: insurance,
                message: "Insurance updated successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceController.updateInsurance: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteInsurance(req, res) {
        try {
            const { user_id } = req.user;
            const { insurance_number } = req.params;

            if (!insurance_number) {
                throw new AppError("Insurance number is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedInsuranceNumber = insurance_number.trim();
            if (normalizedInsuranceNumber.length < INSURANCE_NUMBER_MIN_LENGTH || normalizedInsuranceNumber.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`Insurance number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
            }

            await InsuranceService.deleteInsurance(user_id, normalizedInsuranceNumber);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Insurance deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceController.deleteInsurance: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async manualAutoRenewInsurance(req, res) {
        try {
            const { user_id } = req.user;
            const { insurance_number } = req.params;

            if (!insurance_number) {
                throw new AppError("Insurance number is required", STATUS_CODES.BAD_REQUEST);
            }

            const insurance = await InsuranceService.manualAutoRenewInsurance(user_id, insurance_number);

            return res.status(STATUS_CODES.OK).json({
                data: insurance,
                message: "Insurance policy renewed successfully (testing mode)",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceController.manualAutoRenewInsurance: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new InsuranceController();