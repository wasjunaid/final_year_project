const { PaymentService } = require("../../services/Payment/PaymentService");
const { AppError } = require("../../classes/AppErrorClass");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { validateID } = require("../../utils/idUtil");
const { BillService } = require("../../services/Bill/BillService");
const { VALID_CLAIM_STATUSES_OBJECT } = require("../../utils/validConstantsUtil");


class PaymentController {
    async patientToHospital(req, res) {
        try {
            const { person_id } = req.user;
            const { amount, hospital_id, patient_wallet_address, claim_id } = req.body;

            if (!amount) {
                throw new AppError("Amount is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!hospital_id) {
                throw new AppError("Hospital ID is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_wallet_address) {
                throw new AppError("Patient wallet address is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalId = validateID(hospital_id);

            if (!claim_id) {
                throw new AppError("claim_id is required for patient payment", STATUS_CODES.BAD_REQUEST);
            }

            const bill = await BillService.getBillIfExists(claim_id);
            if (!bill) {
                throw new AppError("Bill not found for provided claim_id", STATUS_CODES.NOT_FOUND);
            }

            if (!bill.is_claim || bill.claim_status !== VALID_CLAIM_STATUSES_OBJECT.REJECTED) {
                throw new AppError("Patient payment is only allowed when insurance claim is rejected", STATUS_CODES.BAD_REQUEST);
            }

            const result = await PaymentService.patientToHospital(
                person_id, 
                amount, 
                validatedHospitalId,
                patient_wallet_address,
                claim_id || 0
            );

            return res.status(STATUS_CODES.OK).json({ 
                data: result, 
                message: "Payment processed successfully", 
                success: true 
            });
        } catch (error) {
            console.error(`Error in PaymentController.patientToHospital: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
                data: null,
                message: error.message, 
                success: false 
            });
        }
    }

    async insuranceToHospital(req, res) {
        try {
            console.log('[PaymentController] Insurance to Hospital payment request received');
            console.log('[PaymentController] Body:', req.body);
              
            const { claim_id, hospital_id, amount, insurance_wallet_address } = req.body;
            
            if (!claim_id) {
                throw new AppError("Claim ID is required", STATUS_CODES.BAD_REQUEST);
            }
            
            if (!hospital_id) {
                throw new AppError("Hospital ID is required", STATUS_CODES.BAD_REQUEST);
            }
            
            if (!amount) {
                throw new AppError("Amount is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_wallet_address) {
                throw new AppError("Insurance wallet address is required", STATUS_CODES.BAD_REQUEST);
            }
            
            console.log('[PaymentController] Request validated:', { claim_id, hospital_id, amount, insurance_wallet_address });
            
            const validatedHospitalId = validateID(hospital_id);
            
            console.log('[PaymentController] Calling PaymentService.insuranceToHospital');
            const result = await PaymentService.insuranceToHospital(
                claim_id,
                validatedHospitalId,
                amount,
                insurance_wallet_address
            );
            
            console.log('[PaymentController] Payment processed successfully');
            
            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: "Insurance payment processed successfully",
                success: true
            });
            
        } catch (error) {
            console.error(`[PaymentController] Error in insuranceToHospital: ${error.message}`);
            
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                success: false
            });
        }
    }

    async registerOrUpdateHospital(req, res) {
        try {
            const { hospital_id, wallet_address } = req.body;

            if (!hospital_id) {
                throw new AppError("Hospital ID is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!wallet_address) {
                throw new AppError("Wallet address is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalId = validateID(hospital_id);

            const result = await PaymentService.registerOrUpdateHospital(
                validatedHospitalId,
                wallet_address
            );

            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: `Hospital ${result.action} successfully`,
                success: true
            });

        } catch (error) {
            console.error(`Error in PaymentController.registerOrUpdateHospital: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                success: false
            });
        }
    }

    async getHospitalAddressById(req, res) {
        try {
            const { hospital_id } = req.params;

            if (!hospital_id) {
                throw new AppError("Hospital ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalId = validateID(hospital_id);

            const address = await PaymentService.getHospitalAddressById(validatedHospitalId);

            if (!address) {
                throw new AppError("Hospital not registered on blockchain", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: { hospitalId: validatedHospitalId, address },
                message: "Hospital address retrieved successfully",
                success: true
            });

        } catch (error) {
            console.error(`Error in PaymentController.getHospitalAddressById: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                success: false
            });
        }
    }

    async getWalletBalance(req, res) {
        try {
            const { wallet_address } = req.params;
            
            if (!wallet_address) {
                throw new AppError("Wallet address is required", STATUS_CODES.BAD_REQUEST);
            }
            
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

    async getPatientPaymentHistory(req, res) {
        try {
            const { wallet_address } = req.params;
            
            if (!wallet_address) {
                throw new AppError("Wallet address is required", STATUS_CODES.BAD_REQUEST);
            }
            
            const result = await PaymentService.getPatientPaymentHistory(wallet_address);
            
            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: "Patient payment history retrieved successfully",
                success: true
            });
            
        } catch (error) {
            console.error(`Error in PaymentController.getPatientPaymentHistory: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                success: false
            });
        }
    }

    async getInsurancePaymentHistory(req, res) {
        try {
            const { wallet_address } = req.params;
            
            if (!wallet_address) {
                throw new AppError("Wallet address is required", STATUS_CODES.BAD_REQUEST);
            }
            
            const result = await PaymentService.getInsurancePaymentHistory(wallet_address);
            
            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: "Insurance payment history retrieved successfully",
                success: true
            });
            
        } catch (error) {
            console.error(`Error in PaymentController.getInsurancePaymentHistory: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                success: false
            });
        }
    }

    async getHospitalReceivedHistory(req, res) {
        try {
            const { wallet_address } = req.params;
            
            if (!wallet_address) {
                throw new AppError("Wallet address is required", STATUS_CODES.BAD_REQUEST);
            }
            
            const result = await PaymentService.getHospitalReceivedHistory(wallet_address);
            
            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: "Hospital payment history retrieved successfully",
                success: true
            });
            
        } catch (error) {
            console.error(`Error in PaymentController.getHospitalReceivedHistory: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                success: false
            });
        }
    }
}

module.exports = new PaymentController();