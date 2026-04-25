const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { EHRAccessService } = require("../../services/EHR/EHRAccessService");
const { validateID } = require("../../utils/idUtil");
const {VALID_ROLES_OBJECT} = require("../../validations/auth/authValidations");
const { validateEmail } = require("../../utils/emailUtil");
const { PersonService } = require("../../services/Person/PersonService");

class EHRAccessController {
    async getAllEHRAccessForPatientIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const ehrAccess = await EHRAccessService.getAllEHRAccessForPatientIfExists(person_id);
            if (!ehrAccess) {
                throw new AppError("No EHR access records found for this patient", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: ehrAccess,
                message: 'EHR access retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRAccessController.getAllEHRAccessForPatientIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllEHRAccessForDoctorIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const ehrAccess = await EHRAccessService.getAllEHRAccessForDoctorIfExists(person_id);
            if (!ehrAccess) {
                throw new AppError("No EHR access records found for this doctor", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: ehrAccess,
                message: 'EHR access retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRAccessController.getAllEHRAccessForDoctorIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async requestEHRAccess(req, res) {
        try {
            const { person_id } = req.user;
            const { patient_email, patient_id: patient_id_from_body } = req.body || {};

            let patient_id = patient_id_from_body;

            if (!patient_id) {
                if (!patient_email) {
                    throw new AppError("patient_email or patient_id is required", STATUS_CODES.BAD_REQUEST);
                }

                const patient = await PersonService.getPersonByEmailIfExists(patient_email);
                if (!patient) {
                    throw new AppError("Patient with the provided email does not exist", STATUS_CODES.NOT_FOUND);
                }

                patient_id = patient.person_id;
            }

            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPatientID = validateID(patient_id);

            if (validatedPatientID === person_id) {
                throw new AppError("You cannot request access to your own EHR", STATUS_CODES.BAD_REQUEST);
            }

            const ehrAccess = await EHRAccessService.requestEHRAccess(person_id, validatedPatientID);

            return res.status(STATUS_CODES.OK).json({
                data: ehrAccess,
                message: 'EHR access request created successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRAccessController.requestEHRAccess: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async denyEHRAccess(req, res) {
        try {
            const { person_id } = req.user;
            const { ehr_access_id } = req.params;

            if (!ehr_access_id) {
                throw new AppError('ehr_access_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const validatedEHRAccessID = validateID(ehr_access_id);

            const ehrAccess = await EHRAccessService.denyEHRAccess(person_id, validatedEHRAccessID);

            return res.status(STATUS_CODES.OK).json({
                data: ehrAccess,
                message: 'EHR access denied successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRAccessController.denyEHRAccess: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async grantEHRAccess(req, res) {
        try {
            const { person_id } = req.user;
            const { ehr_access_id } = req.params;
            const { email } = req.body || {};

            let ehrAccess;
            if (!ehr_access_id) {
                if (!email) {
                    throw new AppError('Either ehr_access_id or email is required', STATUS_CODES.BAD_REQUEST);
                }

                const validatedEmail = validateEmail(email);

                ehrAccess = await EHRAccessService.grantEHRAccess(person_id, false, { doctor_email: validatedEmail });
            } else {
                const validatedEHRAccessID = validateID(ehr_access_id);
                
                ehrAccess = await EHRAccessService.grantEHRAccess(person_id, validatedEHRAccessID);
            }

            return res.status(STATUS_CODES.OK).json({
                data: ehrAccess,
                message: 'EHR access granted successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRAccessController.grantEHRAccess: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async revokeEHRAccess(req, res) {
        try {
            const { person_id } = req.user;
            const { ehr_access_id } = req.params;

            if (!ehr_access_id) {
                throw new AppError('ehr_access_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const validatedEHRAccessID = validateID(ehr_access_id);

            const ehrAccess = await EHRAccessService.revokeEHRAccess(person_id, validatedEHRAccessID);

            return res.status(STATUS_CODES.OK).json({
                data: ehrAccess,
                message: 'EHR access revoked successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRAccessController.revokeEHRAccess: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
    
      /**
     * Get complete global access history from blockchain
     */
    async getAccessHistoryFromBlockchain(req, res) {
        try {
            const { person_id, role } = req.user; // Get authenticated user info from JWT

            const filters = {};

            // Role-based access control
            if (role === VALID_ROLES_OBJECT.PATIENT) {
                // Patients can ONLY see their own access history
                filters.patient_id = person_id;
                console.log(`[Access History] Patient ${person_id} requesting their history`);
            } 
            else if (role === VALID_ROLES_OBJECT.DOCTOR) {
                // Doctors can ONLY see their own access history
                filters.doctor_id = person_id;
                console.log(`[Access History] Doctor ${person_id} requesting their history`);
            } 
            else if (
                role === VALID_ROLES_OBJECT.SUPER_ADMIN || 
                role === VALID_ROLES_OBJECT.ADMIN
            ) {
                // Admins can see ALL history or filter by query params
                const { patient_id, doctor_id } = req.query;
                
                if (patient_id) {
                    filters.patient_id = validateID(patient_id);
                }
                if (doctor_id) {
                    filters.doctor_id = validateID(doctor_id);
                }
                console.log(`[Access History] Admin requesting history with filters:`, filters);
            } 
            else {
                throw new AppError('Unauthorized to view access history', STATUS_CODES.FORBIDDEN);
            }

            const history = await EHRAccessService.getAccessHistoryFromBlockchain(filters);

            return res.status(STATUS_CODES.OK).json({
                data: history,
                message: 'Access history retrieved from blockchain successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRAccessController.getAccessHistoryFromBlockchain: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Failed to retrieve access history',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    
    /**
     * Get patient EHR data for doctor with blockchain verification
     */
    async getPatientEHRDataForDoctor(req, res) {
        try {
            const { person_id } = req.user; // Doctor ID from JWT
            const { patient_id } = req.body;

            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const validatedPatientID = validateID(patient_id);

            const result = await EHRAccessService.getPatientEHRDataForDoctor(
                validatedPatientID,
                person_id
            );

            return res.status(STATUS_CODES.OK).json({
                data: result.ehrData,
                verification: result.verification,
                message: 'Patient EHR data retrieved and verified successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRAccessController.getPatientEHRDataForDoctor: ${error.message}`);
            
            // Special handling for hash mismatch
            if (error.data?.errorType === 'HASH_MISMATCH') {
                return res.status(STATUS_CODES.FORBIDDEN).json({
                    data: null,
                    message: error.message,
                    status: STATUS_CODES.FORBIDDEN,
                    success: false,
                    securityAlert: {
                        type: 'TAMPER_DETECTED',
                        details: error.data
                    }
                });
            }

            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Failed to retrieve patient EHR data',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

}

module.exports = new EHRAccessController();