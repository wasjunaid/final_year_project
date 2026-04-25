const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PatientInsuranceService } = require("../../services/Patient/PatientInsuranceService");
const { validateID } = require("../../utils/idUtil");
const { INSURANCE_NUMBER_MIN_LENGTH, INSURANCE_NUMBER_MAX_LENGTH, VALID_INSURANCE_RELATION_TO_HOLDER } = require("../../utils/validConstantsUtil");

class PatientInsuranceController {
    async getAllPatientInsurancesIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const patient_insurances = await PatientInsuranceService.getAllPatientInsurancesIfExists(person_id);
            if (!patient_insurances) {
                throw new AppError("No patient insurances found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: patient_insurances,
                message: 'Patient insurances retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientInsuranceController.getAllPatientInsurancesIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPatientInsurance(req, res) {
        try {
            const { person_id } = req.user;
            const { insurance_company_id, insurance_number, policy_holder_name, relationship_to_holder, is_primary } = req.body;

            if (!insurance_company_id) {
                throw new AppError("insurance_company_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedInsuranceCompanyID = validateID(insurance_company_id);

            if (!insurance_number) {
                throw new AppError("insurance_number is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof insurance_number !== 'string') {
                throw new AppError("insurance_number must be a string", STATUS_CODES.BAD_REQUEST);
            }

            if (insurance_number.length < INSURANCE_NUMBER_MIN_LENGTH || insurance_number.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`insurance_number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
            }

            if (!policy_holder_name) {
                throw new AppError("policy_holder_name is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedPolicyHolderName = policy_holder_name.trim();
            if (normalizedPolicyHolderName.length === 0) {
                throw new AppError("policy_holder_name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!relationship_to_holder) {
                throw new AppError("relationship_to_holder is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedRelationshipToHolder = relationship_to_holder.trim().toLowerCase();
            if (normalizedRelationshipToHolder.length === 0) {
                throw new AppError("relationship_to_holder cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!VALID_INSURANCE_RELATION_TO_HOLDER.includes(`${normalizedRelationshipToHolder}`)) {
                throw new AppError(`relationship_to_holder must be one of: ${VALID_INSURANCE_RELATION_TO_HOLDER.join(", ")}`, STATUS_CODES.BAD_REQUEST);
            }

            if (typeof is_primary !== 'boolean') {
                throw new AppError("is_primary must be a boolean", STATUS_CODES.BAD_REQUEST);
            }

            const new_patient_insurance = await PatientInsuranceService.insertPatientInsurance({
                patient_id: person_id,
                insurance_company_id: validatedInsuranceCompanyID,
                insurance_number,
                policy_holder_name: normalizedPolicyHolderName,
                relationship_to_holder: normalizedRelationshipToHolder,
                is_primary
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: new_patient_insurance,
                message: 'Patient insurance inserted successfully',
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientInsuranceController.insertPatientInsurance: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updatePatientInsurance(req, res) {
        try {
            const { person_id } = req.user;
            const { patient_insurance_id } = req.params;
            const { is_primary, auto_renewal_enabled } = req.body;

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPatientInsuranceID = validateID(patient_insurance_id);

            if (typeof is_primary !== 'undefined' && typeof is_primary !== 'boolean') {
                throw new AppError("is_primary must be a boolean", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof auto_renewal_enabled !== 'undefined' && typeof auto_renewal_enabled !== 'boolean') {
                throw new AppError("auto_renewal_enabled must be a boolean", STATUS_CODES.BAD_REQUEST);
            }

            let updated_patient_insurance = null;

            if (typeof is_primary === 'boolean') {
                updated_patient_insurance = await PatientInsuranceService.updatePatientInsurance({
                    patient_id: person_id,
                    patient_insurance_id: validatedPatientInsuranceID,
                    is_primary
                });
            }

            if (typeof auto_renewal_enabled === 'boolean') {
                updated_patient_insurance = await PatientInsuranceService.toggleAutoRenewal(
                    person_id,
                    validatedPatientInsuranceID,
                    auto_renewal_enabled
                );
            }

            if (!updated_patient_insurance) {
                throw new AppError("At least one updatable field is required", STATUS_CODES.BAD_REQUEST);
            }

            return res.status(STATUS_CODES.OK).json({
                data: updated_patient_insurance,
                message: 'Patient insurance updated successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientInsuranceController.updatePatientInsurance: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async togglePatientInsuranceAutoRenew(req, res) {
        try {
            const { person_id } = req.user;
            const { patient_insurance_id } = req.params;
            const { auto_renewal_enabled } = req.body;

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof auto_renewal_enabled !== 'boolean') {
                throw new AppError("auto_renewal_enabled must be a boolean", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPatientInsuranceID = validateID(patient_insurance_id);

            const updated_patient_insurance = await PatientInsuranceService.toggleAutoRenewal(
                person_id,
                validatedPatientInsuranceID,
                auto_renewal_enabled
            );

            return res.status(STATUS_CODES.OK).json({
                data: updated_patient_insurance,
                message: 'Patient insurance auto-renewal updated successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientInsuranceController.togglePatientInsuranceAutoRenew: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deactivatePatientInsurance(req, res) {
        try {
            const { person_id } = req.user;
            const { patient_insurance_id } = req.params;
            const { deactivation_reason } = req.body || {};

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPatientInsuranceID = validateID(patient_insurance_id);

            const updated_patient_insurance = await PatientInsuranceService.deactivatePatientInsurance(
                person_id,
                validatedPatientInsuranceID,
                typeof deactivation_reason === 'string' && deactivation_reason.trim().length > 0
                    ? deactivation_reason.trim()
                    : 'deactivated by patient'
            );

            return res.status(STATUS_CODES.OK).json({
                data: updated_patient_insurance,
                message: 'Patient insurance deactivated successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientInsuranceController.deactivatePatientInsurance: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deletePatientInsurance(req, res) {
        try {
            const { person_id } = req.user;
            const { patient_insurance_id } = req.params;

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPatientInsuranceID = validateID(patient_insurance_id);

            await PatientInsuranceService.deletePatientInsurance(person_id, validatedPatientInsuranceID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: 'Patient insurance deleted successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientInsuranceController.deletePatientInsurance: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async sendPatientInsuranceVerificationRequest(req, res) {
        try {
            const { person_id } = req.user;
            const { patient_insurance_id } = req.params;

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPatientInsuranceID = validateID(patient_insurance_id);

            await PatientInsuranceService.sendPatientInsuranceVerificationRequest(person_id, validatedPatientInsuranceID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: 'Patient insurance verification request sent successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientInsuranceController.sendPatientInsuranceVerificationRequest: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PatientInsuranceController();