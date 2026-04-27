const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { InsuranceStaffService } = require("../../services/Insurance/InsuranceStaffService");
const { validateID } = require("../../utils/idUtil");
const { validateEmail } = require("../../utils/emailUtil");

class InsuranceStaffController {
    async getAllInsuranceStaffIfExists(req, res) {
        try {
            const { user_id } = req.user;

            const insuranceStaff = await InsuranceStaffService.getAllInsuranceStaffIfExists(user_id);
            if (!insuranceStaff) {
                // throw new AppError("No insurance staff found", STATUS_CODES.NOT_FOUND);
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: "No insurance staff found",
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: insuranceStaff,
                message: "Insurance staff fetched successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceStaffController.getAllInsuranceStaffIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getInsuranceStaffForSuperAdmin(req, res) {
        try {
            const insuranceStaff = await InsuranceStaffService.getInsuranceStaffForSuperAdmin();
            if (!insuranceStaff) {
                throw new AppError("No insurance staff found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: insuranceStaff,
                message: "Insurance staff fetched successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceStaffController.getInsuranceStaffForSuperAdmin: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertInsuranceStaff(req, res) {
        try {
            const { user_id } = req.user;
            const { email, password, insurance_company_id, role } = req.body;

            if (!email) {
                throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedEmail = validateEmail(email);
            
            if (!password) {
                throw new AppError("password is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedRole = role.trim().toLowerCase();

            if (normalizedRole.length === 0) {
                throw new AppError("role cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            const insuranceStaff = await InsuranceStaffService.insertInsuranceStaff({
                user_id,
                email: validatedEmail,
                password,
                insurance_company_id,
                role: normalizedRole
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: insuranceStaff,
                message: "Insurance staff created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceStaffController.insertInsuranceStaff: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteInsuranceStaff(req, res) {
        try {
            const { user_id } = req.user;
            const { insurance_staff_id } = req.params;

            if (!insurance_staff_id) {
                throw new AppError("insurance_staff_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedInsuranceStaffID = validateID(insurance_staff_id);

            await InsuranceStaffService.deleteInsuranceStaff(user_id, validatedInsuranceStaffID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Insurance staff deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceStaffController.deleteInsuranceStaff: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new InsuranceStaffController();