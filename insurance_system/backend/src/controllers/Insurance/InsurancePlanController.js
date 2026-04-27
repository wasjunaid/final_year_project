const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { InsurancePlanService } = require("../../services/Insurance/InsurancePlanService");
const { validateID } = require("../../utils/idUtil");

class InsurancePlanController {
    async getInsurancePlansIfExists(req, res) {
        try {
            const { user_id } = req.user;

            const insurancePlans = await InsurancePlanService.getInsurancePlansIfExists(user_id);
            if (!insurancePlans) {
                // throw new AppError("No insurance plans found", STATUS_CODES.NOT_FOUND);
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: "No insurance plans found",
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: insurancePlans,
                message: "Insurance plans fetched successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsurancePlanController.getInsurancePlansIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertInsurancePlan(req, res) {
        try {
            const { user_id } = req.user;
            const {
                name,
                description,
                coverage_amount,
                number_of_persons
            } = req.body;

            if (!name) {
                throw new AppError("Insurance plan name is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedName = name.trim().toLowerCase();
            if (normalizedName.length === 0) {
                throw new AppError("Insurance plan name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!description) {
                throw new AppError("Insurance plan description is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedDescription = description.trim().toLowerCase();

            if (normalizedDescription.length === 0) {
                throw new AppError("Insurance plan description cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!coverage_amount) {
                throw new AppError("Coverage amount is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!number_of_persons) {
                throw new AppError("Number of persons is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!Number.isFinite(Number(coverage_amount)) || Number(coverage_amount) <= 0) {
                throw new AppError("Invalid coverage amount", STATUS_CODES.BAD_REQUEST);
            }

            if (!Number.isInteger(Number(number_of_persons)) || Number(number_of_persons) <= 0) {
                throw new AppError("Invalid number of persons", STATUS_CODES.BAD_REQUEST);
            }

            const insurancePlan = await InsurancePlanService.insertInsurancePlan({
                user_id,
                name: normalizedName,
                description: normalizedDescription,
                coverage_amount: Number(coverage_amount),
                number_of_persons: Number(number_of_persons)
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: insurancePlan,
                message: "Insurance plan created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsurancePlanController.insertInsurancePlan: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateInsurancePlan(req, res) {
        try {
            const { user_id } = req.user;
            const { insurance_plan_id } = req.params;
            const {
                name,
                description,
                coverage_amount,
                number_of_persons
            } = req.body;

            if (!insurance_plan_id) {
                throw new AppError("Insurance plan ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedInsurancePlanID = validateID(insurance_plan_id);

            if (!name) {
                throw new AppError("Insurance plan name is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedName = name.trim().toLowerCase();
            if (normalizedName.length === 0) {
                throw new AppError("Insurance plan name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!description) {
                throw new AppError("Insurance plan description is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedDescription = description.trim().toLowerCase();

            if (normalizedDescription.length === 0) {
                throw new AppError("Insurance plan description cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!coverage_amount) {
                throw new AppError("Coverage amount is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!number_of_persons) {
                throw new AppError("Number of persons is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!Number.isFinite(Number(coverage_amount)) || Number(coverage_amount) <= 0) {
                throw new AppError("Invalid coverage amount", STATUS_CODES.BAD_REQUEST);
            }

            if (!Number.isInteger(Number(number_of_persons)) || Number(number_of_persons) <= 0) {
                throw new AppError("Invalid number of persons", STATUS_CODES.BAD_REQUEST);
            }

            const insurancePlan = await InsurancePlanService.updateInsurancePlan({
                user_id,
                insurance_plan_id: validatedInsurancePlanID,
                name: normalizedName,
                description: normalizedDescription,
                coverage_amount: Number(coverage_amount),
                number_of_persons: Number(number_of_persons)
            });

            return res.status(STATUS_CODES.OK).json({
                data: insurancePlan,
                message: "Insurance plan updated successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsurancePlanController.updateInsurancePlan: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteInsurancePlan(req, res) {
        try {
            const { user_id } = req.user;
            const { insurance_plan_id } = req.params;

            if (!insurance_plan_id) {
                throw new AppError("Insurance plan ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedInsurancePlanID = validateID(insurance_plan_id);

            await InsurancePlanService.deleteInsurancePlan(user_id, validatedInsurancePlanID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Insurance plan deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsurancePlanController.deleteInsurancePlan: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new InsurancePlanController();