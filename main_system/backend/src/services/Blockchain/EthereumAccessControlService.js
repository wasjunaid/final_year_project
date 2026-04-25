const { ethers } = require('ethers');
const { AppError } = require('../../classes/AppErrorClass');
const { STATUS_CODES } = require('../../utils/statusCodesUtil');

/**
 * Parses blockchain errors into user-friendly messages
 */
function parseBlockchainError(error) {
    console.error('[Blockchain Error]', error);

    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        return new AppError(
            'Blockchain network error. Please try again.',
            STATUS_CODES.SERVICE_UNAVAILABLE
        );
    }

    // Gas estimation errors
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        return new AppError(
            'Transaction would fail. Please check the data.',
            STATUS_CODES.BAD_REQUEST
        );
    }

    // Insufficient funds
    if (error.code === 'INSUFFICIENT_FUNDS') {
        return new AppError(
            'Blockchain service temporarily unavailable (insufficient funds).',
            STATUS_CODES.SERVICE_UNAVAILABLE
        );
    }

    // Nonce errors
    if (error.code === 'NONCE_EXPIRED' || error.code === 'REPLACEMENT_UNDERPRICED') {
        return new AppError(
            'Transaction conflict. Please retry.',
            STATUS_CODES.CONFLICT
        );
    }

    // Contract revert errors
    if (error.reason) {
        return new AppError(
            `Blockchain error: ${error.reason}`,
            STATUS_CODES.BAD_REQUEST
        );
    }

    // Generic error
    return new AppError(
        'Blockchain operation failed. Please try again.',
        STATUS_CODES.INTERNAL_SERVER_ERROR
    );
}

class EthereumAccessControlService {
    constructor() {
        // Validate environment variables
        if (!process.env.ETH_RPC_URL) {
            throw new Error('ETH_RPC_URL not configured in environment');
        }
        if (!process.env.ETH_BACKEND_PRIVATE_KEY) {
            throw new Error('ETH_BACKEND_PRIVATE_KEY not configured in environment');
        }
        if (!process.env.EHR_ACCESS_CONTROL_ADDRESS) {
            throw new Error('EHR_ACCESS_CONTROL_ADDRESS not configured in environment');
        }

        // Initialize provider and wallet
        this.provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
        this.wallet = new ethers.Wallet(process.env.ETH_BACKEND_PRIVATE_KEY, this.provider);

        // Load contract ABI and address
        const contractABI = require('../../../blockchain/abi/EHRAccessControl.json').abi;
        const contractAddress = process.env.EHR_ACCESS_CONTROL_ADDRESS;

        // Initialize contract instance
        this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);

        console.log('[Blockchain] EthereumAccessControlService initialized');
        console.log('[Blockchain] Contract Address:', contractAddress);
        console.log('[Blockchain] Backend Wallet:', this.wallet.address);
    }

    /**
     * Grant access to doctor with IPFS CID and data hash
     * @param {number} patientId - Patient ID
     * @param {number} doctorId - Doctor ID
     * @param {string} ipfsCID - IPFS Content Identifier
     * @param {string} dataHash - SHA-256 hash of patient data
     * @returns {Promise<Object>} Transaction details
     */
    async grantAccess(patientId, doctorId, ipfsCID, dataHash) {
        try {
            console.log('[Blockchain] Granting access...');
            console.log('  Patient ID:', patientId);
            console.log('  Doctor ID:', doctorId);
            console.log('  IPFS CID:', ipfsCID);
            console.log('  Data Hash:', dataHash);

            // Call smart contract function
            const tx = await this.contract.grantAccess(
                patientId,
                doctorId,
                ipfsCID,
                dataHash
            );

            console.log('[Blockchain] Transaction submitted:', tx.hash);

            // Wait for transaction confirmation
            const receipt = await tx.wait();

            console.log('[Blockchain] Transaction confirmed in block:', receipt.blockNumber);

            return {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            throw parseBlockchainError(error);
        }
    }
 

    /**
     * Revoke doctor's access to patient data
     * @param {number} patientId - Patient ID
     * @param {number} doctorId - Doctor ID
     * @returns {Promise<Object>} Transaction details
     */
    async revokeAccess(patientId, doctorId) {
        try {
            console.log('[Blockchain] Revoking access...');
            console.log('  Patient ID:', patientId);
            console.log('  Doctor ID:', doctorId);

            const tx = await this.contract.revokeAccess(patientId, doctorId);

            console.log('[Blockchain] Revocation transaction submitted:', tx.hash);

            const receipt = await tx.wait();

            console.log('[Blockchain] Revocation confirmed in block:', receipt.blockNumber);

            return {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            throw parseBlockchainError(error);
        }
    }

    /**
     * Deny doctor's access request
     * @param {number} patientId - Patient ID
     * @param {number} doctorId - Doctor ID
     * @returns {Promise<Object>} Transaction details
     */
    async denyAccess(patientId, doctorId) {
        try {
            console.log('[Blockchain] Denying access...');
            console.log('  Patient ID:', patientId);
            console.log('  Doctor ID:', doctorId);

            const tx = await this.contract.denyAccess(patientId, doctorId);

            console.log('[Blockchain] Deny transaction submitted:', tx.hash);

            const receipt = await tx.wait();

            console.log('[Blockchain] Deny confirmed in block:', receipt.blockNumber);

            return {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            throw parseBlockchainError(error);
        }
    }

    static async requestEHRAccess(doctor_id, patient_id) {
        try {
            if (!doctor_id) {
                throw new AppError('doctor_id is required', STATUS_CODES.BAD_REQUEST);
            }
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            // Insert/get EHR access record
            const ehrAccess = await this.insertEHRAccessIfNotExists(patient_id, doctor_id);
            if (!ehrAccess) {
                throw new AppError('Failed to create or retrieve EHR access record', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            // ✅ ADD BLOCKCHAIN CALL
            console.log('[EHR Request] Calling blockchain requestAccess...');
            const blockchainService = new EthereumAccessControlService();
            const txResult = await blockchainService.requestAccess(patient_id, doctor_id);
            console.log('[EHR Request] ✓ Blockchain transaction:', txResult.txHash);

            // Update status with blockchain tx hash
            const query = {
                text: `UPDATE ehr_access
                    SET status = $1,
                        blockchain_tx_hash = $2,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE ehr_access_id = $3
                    RETURNING *`,
                values: [
                    VALID_EHR_ACCESS_STATUSES_OBJECT.REQUESTED,
                    txResult.txHash,
                    ehrAccess.ehr_access_id
                ]
            };
            const result = await DatabaseService.query(query.text, query.values);

            return result.rows[0];
        } catch (error) {
            console.error(`Error in EHRAccessService.requestEHRAccess: ${error.message}`);
            throw error;
        }
    }

        /**
     * Request access to patient data
     * @param {number} patientId - Patient ID
     * @param {number} doctorId - Doctor ID
     * @returns {Promise<Object>} Transaction details
     */
    async requestAccess(patientId, doctorId) {
        try {
            console.log('[Blockchain] Requesting access...');
            console.log('  Patient ID:', patientId);
            console.log('  Doctor ID:', doctorId);

            const tx = await this.contract.requestAccess(patientId, doctorId);

            console.log('[Blockchain] Request transaction submitted:', tx.hash);

            const receipt = await tx.wait();

            console.log('[Blockchain] Request confirmed in block:', receipt.blockNumber);

            return {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            throw parseBlockchainError(error);
        }
    }

    static async revokeEHRAccess(patient_id, ehr_access_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }
            if (!ehr_access_id) {
                throw new AppError('ehr_access_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const ehrAccess = await this.getEHRAccessIfExists(ehr_access_id);
            if (!ehrAccess) {
                throw new AppError('EHR access record not found', STATUS_CODES.NOT_FOUND);
            }
            if (ehrAccess.patient_id !== patient_id) {
                throw new AppError('EHR access does not belong to the specified patient', STATUS_CODES.FORBIDDEN);
            }

            // ✅ ADD BLOCKCHAIN CALL
            console.log('[EHR Revoke] Calling blockchain revokeAccess...');
            const blockchainService = new EthereumAccessControlService();
            const txResult = await blockchainService.revokeAccess(patient_id, ehrAccess.doctor_id);
            console.log('[EHR Revoke] ✓ Blockchain transaction:', txResult.txHash);

            // Update PostgreSQL
            const query = {
                text: `UPDATE ehr_access
                    SET status = $1,
                        blockchain_tx_hash = $2,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE ehr_access_id = $3 AND patient_id = $4
                    RETURNING *`,
                values: [
                    VALID_EHR_ACCESS_STATUSES_OBJECT.REVOKED,
                    txResult.txHash,
                    ehr_access_id,
                    patient_id
                ]
            };
            const result = await DatabaseService.query(query.text, query.values);

            if (result.rowCount === 0) {
                throw new AppError('Failed to revoke EHR access', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in EHRAccessService.revokeEHRAccess: ${error.message}`);
            throw error;
        }
    }

   /**
     * Get complete global access history from blockchain
     * @returns {Promise<Array>} Complete access history logs
     */
    async getAccessHistory() {
        try {
            console.log('[Blockchain] Fetching complete access history...');

            const history = await this.contract.getAccessHistory();
            
            // Convert BigInt values to numbers and format the response
            const formattedHistory = history.map(log => ({
                patientId: Number(log.patientId),
                doctorId: Number(log.doctorId),
                status: Number(log.status), // 0=NONE, 1=REQUESTED, 2=GRANTED, 3=DENIED, 4=REVOKED
                timestamp: Number(log.timestamp),
                ipfsCID: log.ipfsCID,
                dataHash: log.dataHash
            }));

            console.log('[Blockchain] ✓ History retrieved:', formattedHistory.length, 'entries');
            return formattedHistory;
        } catch (error) {
            console.error('[Blockchain Error]', error);
            throw parseBlockchainError(error);
        }
    }

    /**
     * Get access grant details from blockchain
     * @param {number} patientId - Patient ID
     * @param {number} doctorId - Doctor ID
     * @returns {Promise<Object>} Access grant data from blockchain
     */
    async getAccessGrantFromBlockchain(patientId, doctorId) {
        try {
            console.log('[Blockchain] Fetching access grant from blockchain...');
            console.log('  Patient ID:', patientId);
            console.log('  Doctor ID:', doctorId);

            // Call the public mapping getter
            const accessGrant = await this.contract.accessGrants(patientId, doctorId);
            
            console.log('[Blockchain] ✓ Access grant retrieved from blockchain');

            return {
                status: Number(accessGrant.status), // 0=NONE, 1=REQUESTED, 2=GRANTED, 3=DENIED, 4=REVOKED
                timestamp: Number(accessGrant.timestamp),
                ipfsCID: accessGrant.ipfsCID,
                dataHash: accessGrant.dataHash
            };
        } catch (error) {
            console.error('[Blockchain Error]', error);
            throw parseBlockchainError(error);
        }
    }

    /**
     * Get paginated access history from blockchain
     * @param {number} offset - Starting index
     * @param {number} limit - Number of records to fetch
     * @returns {Promise<Array>} Paginated access history logs
     */
    async getAccessHistoryPaginated(offset, limit) {
        try {
            console.log('[Blockchain] Fetching paginated access history...');
            console.log('  Offset:', offset);
            console.log('  Limit:', limit);

            const history = await this.contract.getAccessHistoryPaginated(offset, limit);
            
            const formattedHistory = history.map(log => ({
                patientId: Number(log.patientId),
                doctorId: Number(log.doctorId),
                status: Number(log.status),
                timestamp: Number(log.timestamp),
                ipfsCID: log.ipfsCID,
                dataHash: log.dataHash
            }));

            console.log('[Blockchain] ✓ Paginated history retrieved:', formattedHistory.length, 'entries');
            return formattedHistory;
        } catch (error) {
            console.error('[Blockchain Error]', error);
            throw parseBlockchainError(error);
        }
    }

}

module.exports = { EthereumAccessControlService };