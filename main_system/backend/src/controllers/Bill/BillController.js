const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { BillService } = require("../../services/Bill/BillService");

class BillController {
    async getBillAgainstAppointmentIfExists(req, res) {
        try {
            const { appointment_id } = req.params;

            const bill = await BillService.getBillAgainstAppointmentIfExists(appointment_id);
            if (!bill) {
                throw new AppError("Bill not found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: bill,
                message: "Bill retrieved successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in BillController.getBillAgainstAppointmentIfExists: ${error.message} ${error.status}`);
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
            const { claim_id, status } = req.body;

            const updatedClaim = await BillService.updateClaimStatus(claim_id, status);

            return res.status(STATUS_CODES.OK).json({
                data: updatedClaim,
                message: "Claim status updated successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in BillController.updateClaimStatus: ${error.message} ${error.status}`);
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
            const { claim_id, transaction_hash, block_number, from_wallet, to_wallet, amount_paid } = req.body;

            const updatedTransactionDetails = await BillService.updateTransactionDetails({
                bill_id: claim_id,
                transaction_hash,
                block_number,
                from_wallet,
                to_wallet,
                amount_paid
            });

            return res.status(STATUS_CODES.OK).json({
                data: updatedTransactionDetails,
                message: "Transaction Details updated successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in BillController.updateTransactionDetails: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async resendClaimForPatient(req, res) {
        try {
            const { person_id } = req.user;
            const { bill_id } = req.params;

            console.log(`Resending claim for patient with person_id: ${person_id} and bill_id: ${bill_id}`);

            const resentClaim = await BillService.resendClaimForPatient(person_id, bill_id);

            return res.status(STATUS_CODES.OK).json({
                data: resentClaim,
                message: "Claim resent successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in BillController.resendClaimForPatient: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }
}

module.exports = new BillController();