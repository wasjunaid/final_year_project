const { PaymentService } = require("../../services/Payment/PaymentService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

class PaymentController {
    /**
     * Process payment from insurance to hospital
     */
    async makePaymentToHospital(req, res) {
        try {
            const { insurance_wallet_address, hospital_id, amount, claim_id } = req.body;
            console.log("Request body received in controller:", req.body);

            const result = await PaymentService.makePaymentToHospital(
                insurance_wallet_address,
                hospital_id,
                amount,
                claim_id
            );

            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: "Payment to hospital completed successfully",
                success: true
            });
        } catch (error) {
            console.error(`Error in PaymentController.makePaymentToHospital: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                success: false
            });
        }
    }

    /**
     * Get insurance wallet balance
     */
    async getWalletBalance(req, res) {
        try {
            const { wallet_address } = req.params;

            const result = await PaymentService.getWalletBalance(wallet_address);

            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: "Wallet balance retrieved successfully",
                success: true
            });
        } catch (error) {
            console.error(`Error in PaymentController.getWalletBalance: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                success: false
            });
        }
    }

    /**
     * Get insurance payment history
     */
    async getPaymentHistory(req, res) {
        try {
            const { wallet_address } = req.params;

            const result = await PaymentService.getInsurancePaymentHistory(wallet_address);

            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: "Payment history retrieved successfully",
                success: true
            });
        } catch (error) {
            console.error(`Error in PaymentController.getPaymentHistory: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                success: false
            });
        }
    }
}

module.exports = new PaymentController();