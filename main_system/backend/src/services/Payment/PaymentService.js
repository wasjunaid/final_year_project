const { ethers } = require('ethers');
const { AppError } = require("../../classes/AppErrorClass");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { HospitalService } = require("../Hospital/HospitalService");
const { BillService } = require("../Bill/BillService");

class PaymentService {
    constructor() {
        // Validate environment variables
        if (!process.env.ETH_RPC_URL) {
            throw new Error('ETH_RPC_URL is not configured in .env');
        }
        
        if (!process.env.ETH_BACKEND_PRIVATE_KEY) {
            throw new Error('ETH_BACKEND_PRIVATE_KEY is not configured in .env');
        }
        
        if (!process.env.PAYMENT_CONTRACT_ADDRESS) {
            throw new Error('PAYMENT_CONTRACT_ADDRESS is not configured in .env. Please deploy the Payment contract first.');
        }

        this.provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
        this.signer = new ethers.Wallet(process.env.ETH_BACKEND_PRIVATE_KEY, this.provider);
        
        const abi = [
            "function transferFromPatient(address from, address to, uint amount, uint256 claimId) payable",
            "function transferFromInsurance(address from, address to, uint amount, uint256 claimId) payable",
            "function getWalletBalance(address wallet) view returns (uint256)",
            "function getPatientPaymentTotal(address patient) view returns (uint256)",
            "function getInsurancePaymentTotal(address insurance) view returns (uint256)",
            "function getPatientTransactionHistory(address patient) view returns (tuple(address from, address to, uint amount, uint256 timestamp, string transactionType, uint256 claimId)[])",
            "function getInsuranceTransactionHistory(address insurance) view returns (tuple(address from, address to, uint amount, uint256 timestamp, string transactionType, uint256 claimId)[])",
            "function getHospitalReceivedHistory(address hospital) view returns (tuple(address from, address to, uint amount, uint256 timestamp, string transactionType, uint256 claimId)[])",
            "function getPatientTransactionCount(address patient) view returns (uint256)",
            "function getInsuranceTransactionCount(address insurance) view returns (uint256)",
            "function getHospitalReceivedCount(address hospital) view returns (uint256)",
            "function registerHospital(uint hospitalId, address hospital)",
            "function getHospitalAddress(uint hospitalId) view returns (address)",
            "event PatientTransfer(address indexed from, address indexed to, uint amount, uint256 timestamp, uint256 claimId)",
            "event InsuranceTransfer(address indexed from, address indexed to, uint amount, uint256 timestamp, uint256 claimId)",
            "event HospitalRegistered(uint indexed hospitalId, address indexed hospital)",
            "event HospitalUpdated(uint indexed hospitalId, address indexed oldAddress, address indexed newAddress)"
        ];
        
        this.contract = new ethers.Contract(
            process.env.PAYMENT_CONTRACT_ADDRESS, 
            abi, 
            this.signer
        );
    }

    /**
     * Register or update hospital wallet address on blockchain
     */
    async registerOrUpdateHospital(hospital_id, wallet_address) {
        try {
            console.log(`[Payment] Registering/Updating hospital ${hospital_id} with address ${wallet_address}`);

            // Check if hospital already registered
            const existingAddress = await this.contract.getHospitalAddress(hospital_id);
            
            const tx = await this.contract.registerHospital(hospital_id, wallet_address);
            
            console.log(`[Payment] Transaction submitted: ${tx.hash}`);
            
            const receipt = await tx.wait(1);
            
            console.log(`[Payment] Transaction confirmed in block: ${receipt.blockNumber}`);

            const isUpdate = existingAddress !== ethers.ZeroAddress;

            return {
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                explorerUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`,
                hospitalId: hospital_id,
                walletAddress: wallet_address,
                action: isUpdate ? 'updated' : 'registered',
                oldAddress: isUpdate ? existingAddress : null,
                status: 'confirmed'
            };
        } catch (error) {
            console.error(`[Payment] Error in registerOrUpdateHospital: ${error.message}`);
            throw new AppError(`Hospital registration failed: ${error.message}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get hospital wallet address from blockchain
     */
    async getHospitalAddressById(hospital_id) {
        try {
            const address = await this.contract.getHospitalAddress(hospital_id);
            
            if (address === ethers.ZeroAddress) {
                return null;
            }
            
            return address;
        } catch (error) {
            console.error(`[Payment] Error getting hospital address: ${error.message}`);
            throw new AppError(`Failed to get hospital address: ${error.message}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Patient pays hospital directly
     */
    async patientToHospital(person_id, amount, hospital_id, patient_wallet_address, claim_id = 0) {
        try {
            const hospital = await HospitalService.getHospitalIfExists(hospital_id);
            if (!hospital) {
                throw new AppError("Hospital not found", STATUS_CODES.NOT_FOUND);
            }
            
            if (!hospital.wallet_address) {
                throw new AppError("Hospital wallet address not configured", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_wallet_address) {
                throw new AppError("Patient wallet address is required", STATUS_CODES.BAD_REQUEST);
            }

            const amountFloat = parseFloat(amount);
            if (isNaN(amountFloat) || amountFloat <= 0) {
                throw new AppError("Invalid amount", STATUS_CODES.BAD_REQUEST);
            }

            // Convert amount to string for ethers.parseEther
            const amountString = amountFloat.toFixed(18).replace(/\.?0+$/, '');

            console.log(`[Payment] Patient ${person_id} (${patient_wallet_address}) paying ${amountString} ETH to hospital ${hospital_id} for claim ${claim_id}`);

            const tx = await this.contract.transferFromPatient(
                patient_wallet_address,
                hospital.wallet_address, 
                ethers.parseEther(amountString),
                claim_id,
                { value: ethers.parseEther(amountString) }
            );
            
            console.log(`[Payment] Transaction submitted: ${tx.hash}`);
            
            const receipt = await tx.wait(1);
            
            console.log(`[Payment] Transaction confirmed in block: ${receipt.blockNumber}`);

            const transactionUpdate = await BillService.updateTransactionDetails({
                bill_id: claim_id,
                transaction_hash: tx.hash,
                block_number: receipt.blockNumber,
                from_wallet: patient_wallet_address,
                to_wallet: hospital.wallet_address,
                amount_paid: amount,
            });

            return { 
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                explorerUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`,
                from: patient_wallet_address,
                to: hospital.wallet_address,
                amount: amount,
                claimId: claim_id,
                status: 'confirmed'
            };
        } catch (error) {
            console.error(`[Payment] Error in patientToHospital: ${error.message}`);
            throw new AppError(`Payment failed: ${error.message}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Insurance pays hospital (called from insurance backend)
     */
    async insuranceToHospital(claim_id, hospital_id, amount, insurance_wallet_address) {
        try {
            const hospital = await HospitalService.getHospitalIfExists(hospital_id);
            if (!hospital) {
                throw new AppError("Hospital not found", STATUS_CODES.NOT_FOUND);
            }
            
            if (!hospital.wallet_address) {
                throw new AppError("Hospital wallet address not configured", STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_wallet_address) {
                throw new AppError("Insurance wallet address is required", STATUS_CODES.BAD_REQUEST);
            }

            const amountFloat = parseFloat(amount);
            if (isNaN(amountFloat) || amountFloat <= 0) {
                throw new AppError("Invalid amount", STATUS_CODES.BAD_REQUEST);
            }

            // Convert amount to string for ethers.parseEther
            const amountString = String(amount);

            console.log(`[Payment] Insurance (${insurance_wallet_address}) paying ${amountString} ETH for claim ${claim_id} to hospital ${hospital_id}`);

            const tx = await this.contract.transferFromInsurance(
                insurance_wallet_address,
                hospital.wallet_address, 
                ethers.parseEther(amountString),
                claim_id,
                { value: ethers.parseEther(amountString) }
            );
            
            console.log(`[Payment] Transaction submitted: ${tx.hash}`);
            
            const receipt = await tx.wait(1);
            
            console.log(`[Payment] Transaction confirmed in block: ${receipt.blockNumber}`);

            const transactionUpdate = await BillService.updateTransactionDetails({
                bill_id: claim_id,
                transaction_hash: tx.hash,
                block_number: receipt.blockNumber,
                from_wallet: insurance_wallet_address,
                to_wallet: hospital.wallet_address,
                amount_paid: amount,
            });

            return { 
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                explorerUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`,
                from: insurance_wallet_address,
                to: hospital.wallet_address,
                amount: amount,
                claimId: claim_id,
                status: 'confirmed'
            };
        } catch (error) {
            console.error(`[Payment] Error in insuranceToHospital: ${error.message}`);
            throw new AppError(`Payment failed: ${error.message}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    async getWalletBalance(walletAddress) {
        try {
            const balance = await this.contract.getWalletBalance(walletAddress);
            return {
                balance: ethers.formatEther(balance),
                balanceWei: balance.toString()
            };
        } catch (error) {
            throw new AppError(`Failed to get wallet balance: ${error.message}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get patient payment history with transaction details
     */
    async getPatientPaymentHistory(patientAddress) {
        try {
            // Get total amount
            const total = await this.contract.getPatientPaymentTotal(patientAddress);
            
            // Get transaction history
            const history = await this.contract.getPatientTransactionHistory(patientAddress);
            
            // Format transactions
            const transactions = history.map(tx => ({
                from: tx.from,
                to: tx.to,
                amount: ethers.formatEther(tx.amount),
                amountWei: tx.amount.toString(),
                timestamp: Number(tx.timestamp),
                date: new Date(Number(tx.timestamp) * 1000).toISOString(),
                transactionType: tx.transactionType,
                claimId: Number(tx.claimId)
            }));

            return {
                totalPaid: ethers.formatEther(total),
                totalPaidWei: total.toString(),
                transactionCount: transactions.length,
                transactions: transactions
            };
        } catch (error) {
            throw new AppError(`Failed to get payment history: ${error.message}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get insurance payment history with transaction details
     */
    async getInsurancePaymentHistory(insuranceAddress) {
        try {
            // Get total amount
            const total = await this.contract.getInsurancePaymentTotal(insuranceAddress);
            
            // Get transaction history
            const history = await this.contract.getInsuranceTransactionHistory(insuranceAddress);
            
            // Format transactions
            const transactions = history.map(tx => ({
                from: tx.from,
                to: tx.to,
                amount: ethers.formatEther(tx.amount),
                amountWei: tx.amount.toString(),
                timestamp: Number(tx.timestamp),
                date: new Date(Number(tx.timestamp) * 1000).toISOString(),
                transactionType: tx.transactionType,
                claimId: Number(tx.claimId)
            }));

            return {
                totalPaid: ethers.formatEther(total),
                totalPaidWei: total.toString(),
                transactionCount: transactions.length,
                transactions: transactions
            };
        } catch (error) {
            throw new AppError(`Failed to get payment history: ${error.message}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get hospital received payment history
     */
    async getHospitalReceivedHistory(hospitalAddress) {
        try {
            // Get transaction history
            const history = await this.contract.getHospitalReceivedHistory(hospitalAddress);
            
            // Calculate totals
            let totalFromPatients = BigInt(0);
            let totalFromInsurance = BigInt(0);
            
            // Format transactions
            const transactions = history.map(tx => {
                const amount = tx.amount;
                
                if (tx.transactionType === "PATIENT") {
                    totalFromPatients += amount;
                } else if (tx.transactionType === "INSURANCE") {
                    totalFromInsurance += amount;
                }
                
                return {
                    from: tx.from,
                    to: tx.to,
                    amount: ethers.formatEther(amount),
                    amountWei: amount.toString(),
                    timestamp: Number(tx.timestamp),
                    date: new Date(Number(tx.timestamp) * 1000).toISOString(),
                    transactionType: tx.transactionType,
                    claimId: Number(tx.claimId)
                };
            });

            const totalReceived = totalFromPatients + totalFromInsurance;

            return {
                totalReceived: ethers.formatEther(totalReceived),
                totalReceivedWei: totalReceived.toString(),
                totalFromPatients: ethers.formatEther(totalFromPatients),
                totalFromPatientsWei: totalFromPatients.toString(),
                totalFromInsurance: ethers.formatEther(totalFromInsurance),
                totalFromInsuranceWei: totalFromInsurance.toString(),
                transactionCount: transactions.length,
                transactions: transactions
            };
        } catch (error) {
            throw new AppError(`Failed to get hospital payment history: ${error.message}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { PaymentService: new PaymentService() };