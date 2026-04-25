const axios = require('axios');
const { AppError } = require("../../classes/AppErrorClass");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { PROJECT_BACKEND_BASE_URL } = require("../../config/projectBackendConfig");
require('dotenv').config();
const { ClaimService } = require("../Claim/ClaimService");

class PaymentService {
    /**
     * Make payment from insurance to hospital
     * @param {string} insuranceWalletAddress - Insurance company wallet address
     * @param {number} hospital_id - Hospital ID in main backend
     * @param {number} amount - Payment amount
     * @param {string} claimId - Claim ID for reference
     * @returns {Promise<Object>} Payment transaction details
     */
    static async makePaymentToHospital(param_insuranceWalletAddress, param_hospital_id, param_amount, param_claimId) {
        try {
            if (!param_insuranceWalletAddress) {
                throw new AppError("Insurance wallet address is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!param_hospital_id) {
                throw new AppError("Hospital ID is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!param_amount || param_amount <= 0) {
                throw new AppError("Valid payment amount is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!param_claimId) {
                throw new AppError("Claim ID is required", STATUS_CODES.BAD_REQUEST);
            }

            console.log("Ye ma log kar raha hun", {
                insurance_wallet_address: param_insuranceWalletAddress,
                hospital_id: param_hospital_id,
                amount: param_amount,
                claim_id: param_claimId
            });

            const response = await axios.post(
                `${PROJECT_BACKEND_BASE_URL}payment/insurance-to-hospital`,
                {
                    insurance_wallet_address: param_insuranceWalletAddress,
                    hospital_id: param_hospital_id,
                    amount: param_amount,
                    claim_id: param_claimId
                },
                {
                    headers: {
                        'x-insurance-api-key': process.env.INSURANCE_API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.data.success) {
                throw new AppError(
                    response.data.message || "Payment to hospital failed",
                    response.data.status || STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            const { claimId, txHash, blockNumber, from, to, amount } = response.data.data;

            const transactionUpdate = await ClaimService.updateTransactionDetails({
                claim_id: claimId,
                transaction_hash: txHash,
                block_number: blockNumber,
                from_wallet: from,
                to_wallet: to,
                amount_paid: amount
            });

            return response.data.data;
        } catch (error) {
            if (error.response) {
                throw new AppError(
                    error.response.data.message || "Payment to hospital failed",
                    error.response.status || STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }
            console.error(`Error in PaymentService.makePaymentToHospital: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get wallet balance for insurance company
     * @param {string} walletAddress - Insurance wallet address
     * @returns {Promise<Object>} Wallet balance details
     */
    static async getWalletBalance(walletAddress) {
        try {
            if (!walletAddress) {
                throw new AppError("Wallet address is required", STATUS_CODES.BAD_REQUEST);
            }

            const response = await axios.get(
                `${PROJECT_BACKEND_BASE_URL}payment/balance/${walletAddress}`,
                // {
                //     headers: {
                //         'x-insurance-api-key': process.env.INSURANCE_API_KEY
                //     }
                // }
            );

            if (!response.data.success) {
                throw new AppError(
                    response.data.message || "Failed to fetch wallet balance",
                    response.data.status || STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            return response.data.data;
        } catch (error) {
            if (error.response) {
                throw new AppError(
                    error.response.data.message || "Failed to fetch wallet balance",
                    error.response.status || STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }
            console.error(`Error in PaymentService.getWalletBalance: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get payment history for insurance company
     * @param {string} walletAddress - Insurance wallet address
     * @returns {Promise<Object>} Payment history with transactions
     */
    static async getInsurancePaymentHistory(walletAddress) {
        try {
            if (!walletAddress) {
                throw new AppError("Wallet address is required", STATUS_CODES.BAD_REQUEST);
            }

            const response = await axios.get(
                `${PROJECT_BACKEND_BASE_URL}payment/history/insurance/${walletAddress}`,
                 {
                    headers: {
                        'x-insurance-api-key': process.env.INSURANCE_API_KEY
                    }
                }
            );

            if (!response.data.success) {
                throw new AppError(
                    response.data.message || "Failed to fetch payment history",
                    response.data.status || STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            return response.data.data;
        } catch (error) {
            if (error.response) {
                throw new AppError(
                    error.response.data.message || "Failed to fetch payment history",
                    error.response.status || STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }
            console.error(`Error in PaymentService.getInsurancePaymentHistory: ${error.message}`);
            throw error;
        }
    }
}

module.exports = { PaymentService };