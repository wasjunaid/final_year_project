const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PatientService } = require("../../services/Patient/PatientService");
const { NUMBER_MIN_LENGTH, NUMBER_MAX_LENGTH, VALID_BLOOD_GROUPS } = require("../../utils/validConstantsUtil");
const { PATIENT_CONFIG, VALID_SMOKING_STATUSES, VALID_ALCOHOL_STATUSES, VALID_DRUG_USE_STATUSES } = require("../../validations/patient/patientValidations");

class PatientController {
    async getPatientIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const patient = await PatientService.getPatientIfExists(person_id);

            return res.status(STATUS_CODES.OK).json({
                data: patient,
                message: 'Patient retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientController.getPatientIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Patient',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updatePatient(req, res) {
        try {
            const { person_id } = req.user;
            const {
                country_code,
                number,
                emergency_contact_country_code,
                emergency_contact_number,
                blood_group,
                smoking, alcohol, drug_use, wallet_address
            } = req.body;

            const resolvedCountryCode = country_code || emergency_contact_country_code;
            const resolvedNumber = number || emergency_contact_number;

            const updates = {
                country_code: resolvedCountryCode,
                number: resolvedNumber,
                blood_group,
                smoking,
                alcohol,
                drug_use,
                wallet_address
            };

            for (const key in updates) {
                if (updates[key] === undefined || updates[key] === null || updates[key] === '') {
                    delete updates[key];
                }
            }

            if (Object.keys(updates).length === 0) {
                throw new AppError('No fields to update', STATUS_CODES.BAD_REQUEST);
            }

            if (updates.country_code && !updates.number) {
                throw new AppError('Both country_code and number are required to update emergency contact', STATUS_CODES.BAD_REQUEST);
            }

            if (updates.number && !updates.country_code) {
                throw new AppError('Both country_code and number are required to update emergency contact', STATUS_CODES.BAD_REQUEST);
            }

            if (updates.country_code && updates.number) {
                if (updates.number.length < NUMBER_MIN_LENGTH || updates.number.length > NUMBER_MAX_LENGTH) {
                    throw new AppError(`number must be between ${NUMBER_MIN_LENGTH} and ${NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
                }
            }

            if (updates.blood_group) {
                updates.blood_group = updates.blood_group.trim().toUpperCase();
                if (!VALID_BLOOD_GROUPS.includes(updates.blood_group)) {
                    throw new AppError('Invalid blood_group value', STATUS_CODES.BAD_REQUEST);
                }
            }

            if (updates.smoking) {
                updates.smoking = updates.smoking.trim().toLowerCase();
                if (!VALID_SMOKING_STATUSES.includes(updates.smoking)) {
                    throw new AppError('Invalid smoking status value', STATUS_CODES.BAD_REQUEST);
                }
            }

            if (updates.alcohol) {
                updates.alcohol = updates.alcohol.trim().toLowerCase();
                if (!VALID_ALCOHOL_STATUSES.includes(updates.alcohol)) {
                    throw new AppError('Invalid alcohol status value', STATUS_CODES.BAD_REQUEST);
                }
            }

            if (updates.drug_use) {
                updates.drug_use = updates.drug_use.trim().toLowerCase();
                if (!VALID_DRUG_USE_STATUSES.includes(updates.drug_use)) {
                    throw new AppError('Invalid drug use status value', STATUS_CODES.BAD_REQUEST);
                }
            }

            const result = await PatientService.updatePatient(person_id, updates);

            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: 'Patient updated successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientController.updatePatient: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Update Patient',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PatientController();