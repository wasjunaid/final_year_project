const { NotificationService } = require('../Notification/NotificationService');
const { LogService } = require('../Log/LogService');
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const { getFromIPFS } = require('../../utils/ipfs');
const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");
const { VALID_EHR_ACCESS_STATUSES_OBJECT, VALID_EHR_ACCESS_STATUSES } = require("../../utils/validConstantsUtil");
const { encryptCID, decryptCID } = require('../../utils/encryption');
const { EthereumAccessControlService } = require('../Blockchain/EthereumAccessControlService');
const { PatientEHRService } = require('../Patient/PatientEHRService');
const { uploadToIPFS } = require('../../utils/ipfs');
const { canonicalizePatientData } = require('../../utils/canonicalize');
const { ethers } = require('ethers');

class EHRAccessService {
    /**
     * Retrieves an EHR access record by its ID.
     * @param {number} ehr_access_id - The ID of the EHR access record.
     * @return {Promise<object|boolean>} The EHR access record if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getEHRAccessIfExists(ehr_access_id) {
        try {
            if (!ehr_access_id) {
                throw new AppError('ehr_access_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM ehr_access
                WHERE
                ehr_access_id = $1`,
                values: [ehr_access_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in EHRAccessService.getEHRAccessIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Retrieves an EHR access record using patient and doctor IDs.
     * @param {number} patient_id - The ID of the patient.
     * @param {number} doctor_id - The ID of the doctor.
     * @return {Promise<object|boolean>} The EHR access record if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getEHRAccessIfExistsUsingPatientAndDoctorID(patient_id, doctor_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!doctor_id) {
                throw new AppError('doctor_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM ehr_access
                WHERE
                patient_id = $1 AND doctor_id = $2`,
                values: [patient_id, doctor_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in EHRAccessService.getEHRAccessIfExistsUsingPatientAndDoctorID: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Retrieves all EHR access records for a given patient.
     * @param {number} patient_id - The ID of the patient.
     * @return {Promise<Array<object>|boolean>} Array of EHR access records if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAllEHRAccessForPatientIfExists(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM ehr_access
                WHERE
                patient_id = $1`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }
            
            return result.rows;
        } catch (error) {
            console.error(`Error in EHRAccessService.getAllEHRAccessForPatientIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Retrieves all EHR access records for a given doctor.
     * @param {number} doctor_id - The ID of the doctor.
     * @return {Promise<Array<object>|boolean>} Array of EHR access records if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAllEHRAccessForDoctorIfExists(doctor_id) {
        try {
            if (!doctor_id) {
                throw new AppError('doctor_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM ehr_access
                WHERE
                doctor_id = $1`,
                values: [doctor_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }
            
            return result.rows;
        } catch (error) {
            console.error(`Error in EHRAccessService.getAllEHRAccessForDoctorIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }
    
    /**
     * Inserts a new EHR access record if it does not already exist.
     * @param {number} patient_id - The ID of the patient.
     * @param {number} doctor_id - The ID of the doctor.
     * @return {Promise<object|boolean>} The inserted EHR access record if successful, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async insertEHRAccessIfNotExists(patient_id, doctor_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!doctor_id) {
                throw new AppError('doctor_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO ehr_access
                (patient_id, doctor_id)
                VALUES
                ($1, $2)
                ON CONFLICT (patient_id, doctor_id)
                DO
                UPDATE
                SET
                patient_id = EXCLUDED.patient_id
                RETURNING *`,
                values: [patient_id, doctor_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Failed to insert EHR access record', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in EHRAccessService.insertEHRAccessIfNotExists: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError('EHR access record already exists', STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * Updates the status of an EHR access record.
     * @param {number} ehr_access_id - The ID of the EHR access record.
     * @param {string} status - The new status to set.
     * @return {Promise<object>} The updated EHR access record.
     * @throws {AppError} if any issue occurs
     */
    static async updateEHRAccessStatus(ehr_access_id, status) {
        try {
            if (!ehr_access_id) {
                throw new AppError('ehr_access_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!status) {
                throw new AppError('status is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!VALID_EHR_ACCESS_STATUSES.includes(status)) {
                throw new AppError(`status must be one of: ${VALID_EHR_ACCESS_STATUSES.join(', ')}`, STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `UPDATE ehr_access
                SET status = $1
                WHERE ehr_access_id = $2
                RETURNING *`,
                values: [status, ehr_access_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Failed to update EHR access status', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in EHRAccessService.updateEHRAccessStatus: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Requests EHR access for a doctor to a patient's records.
     * @param {number} doctor_id - The ID of the doctor requesting access.
     * @param {number} patient_id - The ID of the patient whose records are being requested.
     * @return {Promise<object>} The updated EHR access record with status 'requested'.
     * @throws {AppError} if any issue occurs
     */
    static async requestEHRAccess(doctor_id, patient_id) {
        try {
            if (!doctor_id) {
                throw new AppError('doctor_id is required', STATUS_CODES.BAD_REQUEST);
            }
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const existingAccess = await this.getEHRAccessIfExistsUsingPatientAndDoctorID(patient_id, doctor_id);

            if (existingAccess && existingAccess.status === VALID_EHR_ACCESS_STATUSES_OBJECT.GRANTED) {
                return existingAccess;
            }

            if (existingAccess && existingAccess.status === VALID_EHR_ACCESS_STATUSES_OBJECT.REQUESTED) {
                return existingAccess;
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
     * Denies EHR access for a patient to a specific EHR access record.
     * @param {number} patient_id - The ID of the patient denying access.
     * @param {number} ehr_access_id - The ID of the EHR access record to be denied.
     * @return {Promise<object>} The updated EHR access record with status 'denied'.
     * @throws {AppError} if any issue occurs
     */
    static async denyEHRAccess(patient_id, ehr_access_id) {
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
            console.log('[EHR Deny] Calling blockchain denyAccess...');
            const blockchainService = new EthereumAccessControlService();
            const txResult = await blockchainService.denyAccess(patient_id, ehrAccess.doctor_id);
            console.log('[EHR Deny] ✓ Blockchain transaction:', txResult.txHash);

            // Update PostgreSQL with blockchain transaction
            const query = {
                text: `UPDATE ehr_access
                SET status = $1, 
                    blockchain_tx_hash = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE ehr_access_id = $3 AND patient_id = $4
                RETURNING *`,
                values: [
                    VALID_EHR_ACCESS_STATUSES_OBJECT.DENIED,
                    txResult.txHash,
                    ehr_access_id,
                    patient_id
                ]
            };
            const result = await DatabaseService.query(query.text, query.values);
            
            if (result.rowCount === 0) {
                throw new AppError('Failed to deny EHR access', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in EHRAccessService.denyEHRAccess: ${error.message}`);
            throw error;
        }
    }

    // /**
    //  * Grants EHR access for a patient to a specific EHR access record or doctor email.
    //  * @param {number} patient_id - The ID of the patient granting access.
    //  * @param {number} ehr_access_id - (Optional) The ID of the EHR access record to be granted.
    //  * @param {object} optionalFields - (Optional) An object containing either ehr_access_id or doctor_email.
    //  * @param {string} optionalFields.doctor_email - (Optional) The email of the doctor to whom access is being granted.
    //  * @return {Promise<object>} The updated EHR access record with status 'granted'.
    //  * @throws {AppError} if any issue occurs
    //  */
    // static async grantEHRAccess(patient_id, ehr_access_id, optionalFields = {}) {
    //     try {
    //         const {
    //             doctor_email = null
    //         } = optionalFields;

    //         if (!patient_id) {
    //             throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
    //         }

    //         let ehrAccess;
    //         if (!ehr_access_id) {
    //             if (!doctor_email) {
    //                 throw new AppError('ehr_access_id or doctor_email is required', STATUS_CODES.BAD_REQUEST);
    //             }

    //             const doctorPerson = await PersonService.getPersonByEmailIfExists(doctor_email);
    //             if (!doctorPerson) {
    //                 throw new AppError('Doctor with the provided email does not exist', STATUS_CODES.NOT_FOUND);
    //             }

    //             const doctor = await DoctorService.getDoctorIfExists(doctorPerson.person_id);
    //             if (!doctor) {
    //                 throw new AppError('Doctor record not found for the provided email', STATUS_CODES.NOT_FOUND);
    //             }

    //             ehrAccess = await this.insertEHRAccessIfNotExists(patient_id, doctor.doctor_id);
    //         } else {
    //             ehrAccess = await this.getEHRAccessIfExists(ehr_access_id);
    //         }

    //         if (!ehrAccess) {
    //             throw new AppError('EHR access record not found', STATUS_CODES.NOT_FOUND);
    //         }

    //         if (ehrAccess.patient_id !== patient_id) {
    //             throw new AppError('EHR access does not belong to the specified patient', STATUS_CODES.FORBIDDEN);
    //         }

    //         const result = await this.updateEHRAccessStatus(ehrAccess.ehr_access_id, VALID_EHR_ACCESS_STATUSES_OBJECT.GRANTED);

    //         return result;
    //     } catch (error) {
    //         console.error(`Error in EHRAccessService.grantEHRAccess: ${error.message} ${error.status}`);
    //         throw error;
    //     }
    // }

    /**
     * Grants EHR access - NOW WITH BLOCKCHAIN (supports REQUESTED and REVOKED statuses)
     * @param {number} patient_id - Patient ID
     * @param {number} ehr_access_id - EHR access record ID
     * @returns {Promise<Object>} Updated EHR access record with blockchain data
     */
    static async grantEHRAccess(patient_id, ehr_access_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }
            if (!ehr_access_id) {
                throw new AppError('ehr_access_id is required', STATUS_CODES.BAD_REQUEST);
            }

            // 1. Validate EHR access exists and belongs to patient
            const ehrAccess = await this.getEHRAccessIfExists(ehr_access_id);
            if (!ehrAccess) {
                throw new AppError('EHR access record not found', STATUS_CODES.NOT_FOUND);
            }
            if (ehrAccess.patient_id !== patient_id) {
                throw new AppError('Unauthorized access to EHR record', STATUS_CODES.FORBIDDEN);
            }

            // reject if ehr access already granted
            if (ehrAccess.status === VALID_EHR_ACCESS_STATUSES_OBJECT.GRANTED) {
            throw new AppError(
                'EHR access is already granted. Use revoke endpoint to revoke access first.',
                STATUS_CODES.BAD_REQUEST
            );
        }

            // Allow granting for both REQUESTED and REVOKED statuses
            if (
                ehrAccess.status !== VALID_EHR_ACCESS_STATUSES_OBJECT.REQUESTED && 
                ehrAccess.status !== VALID_EHR_ACCESS_STATUSES_OBJECT.REVOKED
            ) {
                throw new AppError('Can only grant requested or revoked access', STATUS_CODES.BAD_REQUEST);
            }

            console.log('[EHR Grant] Starting blockchain anchoring process...');
            console.log('[EHR Grant] Current status:', ehrAccess.status);
        
            let ipfsCID, dataHash, txResult, encryptedCID,decryptedCID;

            // Check if this is a re-grant (REVOKED status with existing data)
            if (
                ehrAccess.status === VALID_EHR_ACCESS_STATUSES_OBJECT.REVOKED && 
                ehrAccess.ipfs_cid && 
                ehrAccess.data_hash
            ) {
                // Re-use existing IPFS CID and data hash
                encryptedCID = ehrAccess.ipfs_cid;
                decryptedCID = decryptCID(encryptedCID); // Decrypt for blockchain
    
                ipfsCID = decryptedCID; 
                dataHash = ehrAccess.data_hash;
                
                console.log('[EHR Grant] Re-granting revoked access with existing data');
                console.log('[EHR Grant] ✓ Using existing IPFS CID:', ipfsCID);
                console.log('[EHR Grant] ✓ Using existing data hash:', dataHash);
            } else {
                // Generate new IPFS CID and data hash for first-time grants
                console.log('[EHR Grant] First-time grant - generating new data');

                // 2. Get complete patient EHR data
                const ehrData = await PatientEHRService.getPatientEHRDataForSharing(patient_id);
                console.log('[EHR Grant] ✓ Patient data retrieved');

                // 3. Canonicalize for consistent hashing
                const canonicalData = canonicalizePatientData(ehrData);
                console.log('[EHR Grant] ✓ Data canonicalized');

                // 4. Upload to IPFS
                ipfsCID = await uploadToIPFS(canonicalData);
                console.log('[EHR Grant] ✓ Uploaded to IPFS:', ipfsCID);
                
                // ENCRYPT CID BEFORE STORING - ✅ FIX: Remove 'const' to assign to outer variable
                encryptedCID = encryptCID(ipfsCID);
                console.log('[EHR Grant] ✓ CID encrypted for storage');

                // 5. Generate SHA-256 hash
                dataHash = ethers.keccak256(ethers.toUtf8Bytes(canonicalData));
                console.log('[EHR Grant] ✓ Generated hash:', dataHash);
            }

            // 6. Record on blockchain
            const blockchainService = new EthereumAccessControlService();
            txResult = await blockchainService.grantAccess(
                patient_id,
                ehrAccess.doctor_id,
                ipfsCID,
                dataHash
            );
            console.log('[EHR Grant] ✓ Blockchain transaction:', txResult.txHash);

            // 7. Update PostgreSQL with blockchain data
            const query = {
                text: `UPDATE ehr_access
                    SET status = $1, 
                        ipfs_cid = $2, 
                        data_hash = $3,
                        blockchain_tx_hash = $4,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE ehr_access_id = $5 AND patient_id = $6
                    RETURNING *`,
                values: [
                    VALID_EHR_ACCESS_STATUSES_OBJECT.GRANTED,
                    encryptedCID,
                    dataHash,
                    txResult.txHash,
                    ehr_access_id,
                    patient_id
                ]
            };

            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Failed to grant EHR access', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            // 8. Send notification to doctor
            await NotificationService.insertNotification({
                person_id: ehrAccess.doctor_id,
                role: VALID_ROLES_OBJECT.DOCTOR,
                title: 'EHR Access Granted',
                message: `Patient granted you access to their EHR`,
                type: 'medical',
                related_id: ehr_access_id,
                related_table: 'ehr_access',
                sendEmail: false
            });

            console.log('[EHR Grant] ✅ Access granted successfully');

            return {
                ...result.rows[0],
                blockchain: {
                    txHash: txResult.txHash,
                    blockNumber: txResult.blockNumber,
                    gasUsed: txResult.gasUsed,
                    ipfsCID,
                    dataHash
                }
            };
        } catch (error) {
            console.error(`Error in EHRAccessService.grantEHRAccess: ${error.message}`);
            throw error;
        }
    }

    /**
     * Revokes EHR access for a patient to a specific EHR access record.
     * @param {number} patient_id - The ID of the patient revoking access.
     * @param {number} ehr_access_id - The ID of the EHR access record to be revoked.
     * @return {Promise<object>} The updated EHR access record with status 'revoked'.
     * @throws {AppError} if any issue occurs
     */
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

            // ADD BLOCKCHAIN CALL
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
     * @param {object} filters - Optional filters (patient_id, doctor_id)
     * @returns {Promise<Array>} Access history with readable status names
     */
    static async getAccessHistoryFromBlockchain(filters = {}) {
        try {
            const { patient_id = null, doctor_id = null } = filters;

            const blockchainService = new EthereumAccessControlService();
            const history = await blockchainService.getAccessHistory();

            // Map status numbers to readable names
            const statusMap = {
                0: 'NONE',
                1: 'REQUESTED',
                2: 'GRANTED',
                3: 'DENIED',
                4: 'REVOKED'
            };

            let filteredHistory = history.map(log => ({
                patientId: log.patientId,
                doctorId: log.doctorId,
                status: statusMap[log.status],
                timestamp: new Date(log.timestamp * 1000).toISOString(),
                ipfsCID: log.ipfsCID || null,
                dataHash: log.dataHash !== '0x0000000000000000000000000000000000000000000000000000000000000000' 
                    ? log.dataHash 
                    : null
            }));

            // Apply filters if provided
            if (patient_id) {
                filteredHistory = filteredHistory.filter(log => log.patientId === patient_id);
            }
            if (doctor_id) {
                filteredHistory = filteredHistory.filter(log => log.doctorId === doctor_id);
            }

            const uniquePersonIds = [...new Set(
                filteredHistory.flatMap((log) => [log.patientId, log.doctorId]).filter(Boolean)
            )];

            if (uniquePersonIds.length === 0) {
                return filteredHistory;
            }

            const peopleQuery = {
                text: `SELECT person_id, first_name, last_name, email
                    FROM person_view
                    WHERE person_id = ANY($1::int[])`,
                values: [uniquePersonIds],
            };
            const peopleResult = await DatabaseService.query(peopleQuery.text, peopleQuery.values);

            const peopleById = new Map();
            for (const person of peopleResult.rows) {
                const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim();
                peopleById.set(person.person_id, {
                    name: fullName || null,
                    email: person.email || null,
                });
            }

            return filteredHistory.map((log) => {
                const patient = peopleById.get(log.patientId) || null;
                const doctor = peopleById.get(log.doctorId) || null;

                return {
                    ...log,
                    patientName: patient?.name || null,
                    patientEmail: patient?.email || null,
                    doctorName: doctor?.name || null,
                    doctorEmail: doctor?.email || null,
                };
            });
        } catch (error) {
            console.error(`Error in EHRAccessService.getAccessHistoryFromBlockchain: ${error.message}`);
            throw error;
        }
    }

    
     /**
     * Get patient EHR data for doctor with blockchain verification
     * @param {number} patient_id - Patient ID
     * @param {number} doctor_id - Doctor ID
     * @returns {Promise<Object>} Patient EHR data with verification metadata
     */
    static async getPatientEHRDataForDoctor(patient_id, doctor_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }
            if (!doctor_id) {
                throw new AppError('doctor_id is required', STATUS_CODES.BAD_REQUEST);
            }

            console.log('[EHR Retrieve] Doctor requesting patient data...');
            console.log('  Patient ID:', patient_id);
            console.log('  Doctor ID:', doctor_id);

            // 1. Check PostgreSQL for granted access
            const query = {
                text: `SELECT * FROM ehr_access
                    WHERE patient_id = $1 AND doctor_id = $2 AND status = 'granted'`,
                values: [patient_id, doctor_id]
            };
            const accessResult = await DatabaseService.query(query.text, query.values);

            if (accessResult.rowCount === 0) {
                throw new AppError('No active access grant found', STATUS_CODES.FORBIDDEN);
            }

            const accessRecord = accessResult.rows[0];
            console.log('[EHR Retrieve] ✓ PostgreSQL access verified');

            // 2. Get access grant from BLOCKCHAIN (source of truth for hash)
            console.log('[EHR Retrieve] Fetching hash from blockchain...');
            const blockchainService = new EthereumAccessControlService();
            const blockchainGrant = await blockchainService.getAccessGrantFromBlockchain(patient_id, doctor_id);
            
            if (blockchainGrant.status !== 2) { // 2 = GRANTED
                throw new AppError(
                    'Blockchain verification failed: Access is not granted on-chain',
                    STATUS_CODES.FORBIDDEN
                );
            }
            
            console.log('[EHR Retrieve] ✓ Blockchain hash retrieved:', blockchainGrant.dataHash);

            // 3. Fetch from IPFS using PostgreSQL IPFS CID
            
            console.log('[EHR Retrieve] Fetching data from IPFS...');

            // DECRYPT CID BEFORE USE
            const encryptedCID = accessRecord.ipfs_cid;
            const decryptedCID = decryptCID(encryptedCID); 
            console.log('[EHR Retrieve] ✓ CID decrypted');
            console.log('[EHR Retrieve] IPFS CID:', decryptedCID);
            
            const ipfsData = await getFromIPFS(decryptedCID);
            const ehrData = JSON.parse(ipfsData);
            console.log('[EHR Retrieve] ✓ Data fetched from IPFS');

            // 4. Verify data integrity against BLOCKCHAIN hash (NOT PostgreSQL)
            console.log('[EHR Retrieve] Verifying data integrity against blockchain...');
            const canonicalData = canonicalizePatientData(ehrData);
            const computedHash = ethers.keccak256(ethers.toUtf8Bytes(canonicalData));
            
            console.log('[EHR Retrieve] Blockchain hash:', blockchainGrant.dataHash);
            console.log('[EHR Retrieve] Computed hash:  ', computedHash);
            console.log('[EHR Retrieve] PostgreSQL hash:', accessRecord.data_hash);

            // CRITICAL: Compare against BLOCKCHAIN hash, not PostgreSQL
            if (computedHash !== blockchainGrant.dataHash) {
                // TAMPER DETECTED!
                console.error('[EHR Retrieve] ❌ HASH MISMATCH - DATA TAMPERING DETECTED!');
                
                await LogService.insertLog(
                    doctor_id,
                    `CRITICAL SECURITY ALERT: Blockchain hash mismatch for patient ${patient_id} EHR data`
                );
                
                throw new AppError(
                    'Data integrity verification failed. The data has been tampered with or blockchain record is invalid.',
                    STATUS_CODES.FORBIDDEN,
                    {
                        errorType: 'HASH_MISMATCH',
                        blockchainHash: blockchainGrant.dataHash,
                        computedHash: computedHash,
                        postgresHash: accessRecord.data_hash,
                        ipfsCID: accessRecord.ipfs_cid,
                        source: 'blockchain_verification'
                    }
                );
            }

            // Additional check: Warn if PostgreSQL hash differs from blockchain
            if (accessRecord.data_hash !== blockchainGrant.dataHash) {
                console.warn('[EHR Retrieve] ⚠️ WARNING: PostgreSQL hash differs from blockchain hash!');
                await LogService.insertLog(
                    doctor_id,
                    `WARNING: PostgreSQL hash mismatch for patient ${patient_id} - possible database tampering`
                );
            }
            
            console.log('[EHR Retrieve] ✓ Hash verification passed - Data is authentic (verified against blockchain)');

            // 5. Log successful access
            await LogService.insertLog(
                doctor_id,
                `Accessed verified EHR data for patient ${patient_id} (Blockchain hash verified)`
            );

            console.log('[EHR Retrieve] ✅ Data retrieved and verified successfully');

            return {
                ehrData,
                verification: {
                    verified: true,
                    verificationSource: 'blockchain',
                    grantedAt: accessRecord.updated_at,
                    ipfsCID: accessRecord.ipfs_cid,
                    dataHash: blockchainGrant.dataHash, // Return blockchain hash
                    blockchainTxHash: accessRecord.blockchain_tx_hash,
                    blockchainStatus: blockchainGrant.status,
                    verificationTimestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error(`Error in EHRAccessService.getPatientEHRDataForDoctor: ${error.message}`);
            throw error;
        }
    }


}

module.exports = { EHRAccessService };