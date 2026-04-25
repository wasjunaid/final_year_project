const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { ClaimService } = require("../../services/Claim/ClaimService");

class ClaimController {
    async getAllClaimsIfExists(req, res) {
        try {
            const { user_id } = req.user;

            const claims = await ClaimService.getAllClaimsIfExists(user_id);
            if (!claims) {
                throw new AppError("No claims found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: claims,
                message: "Claims retrieved successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in ClaimController.getAllClaimsIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async getAllAcceptedandNotPaidClaimsAgainstInsuranceCompany(req, res) {
        try {
            const { user_id } = req.user;

            const claims = await ClaimService.getAllAcceptedandNotPaidClaimsAgainstInsuranceCompany(user_id);
            if (!claims) {
                throw new AppError("No accepted and unpaid claims found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: claims,
                message: "Accepted and unpaid claims retrieved successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        }
        catch (error) {
            console.error(`Error in ClaimController.getAllAcceptedandNotPaidClaimsAgainstInsuranceCompany: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async insertClaim(req, res) {
        try {
            const { claim_id_in_hospital_system, insurance_number, cnic, claim_amount, icd_codes, cpt_codes, appointment_date, hospital_name, doctor_name } = req.body;

            const newClaim = await ClaimService.insertClaim({claim_id_in_hospital_system, insurance_number, cnic, claim_amount, icd_codes, cpt_codes, appointment_date, hospital_name, doctor_name});
            
            return res.status(STATUS_CODES.CREATED).json({
                data: newClaim,
                message: "Claim inserted successfully",
                status: STATUS_CODES.CREATED,
                success: true,
            });
        } catch (error) {
            console.error(`Error in ClaimController.insertClaim: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async updateClaimStatus(req, res) {
        try {
            const { claim_id } = req.params;
            const { status } = req.body;

            // maybe send user_id and check if insurance staff belongs to same company as claim

            const updatedClaim = await ClaimService.updateClaimStatus(claim_id, status);
            
            return res.status(STATUS_CODES.OK).json({
                data: updatedClaim,
                message: "Claim status updated successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in ClaimController.updateClaimStatus: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async updateTransactionDetails(req, res) {
        try {
            const { claim_id } = req.params;
            const { transaction_hash, block_number, from_wallet, to_wallet, amount_paid } = req.body;

            const updatedClaim = await ClaimService.updateTransactionDetails({claim_id, transaction_hash, block_number, from_wallet, to_wallet, amount_paid });
            
            return res.status(STATUS_CODES.OK).json({
                data: updatedClaim,
                message: "Claim transaction details updated successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in ClaimController.updateTransactionDetails: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }
}

module.exports = new ClaimController();