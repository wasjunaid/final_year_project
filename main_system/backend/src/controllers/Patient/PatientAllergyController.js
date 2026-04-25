const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PatientAllergyService } = require("../../services/Patient/PatientAllergyService");

class PatientAllergyController {
    async getPatientAllergiesIfExistsForPatient(req, res) {
        try {
            const { person_id } = req.user;

            const allergies = await PatientAllergyService.getPatientAllergiesIfExists(person_id);
            if (!allergies || allergies.length === 0) {
                throw new AppError('No allergies found for the patient', STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: allergies,
                message: 'Patient allergies retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientAllergyController.getPatientAllergiesIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Patient Allergies',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getPatientAllergiesIfExistsForDoctor(req, res) {
        try {
            const { person_id } = req.params;

            const allergies = await PatientAllergyService.getPatientAllergiesIfExists(person_id);
            if (!allergies || allergies.length === 0) {
                throw new AppError('No allergies found for the patient', STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: allergies,
                message: 'Patient allergies retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientAllergyController.getPatientAllergiesIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Patient Allergies',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPatientAllergyIfNotExistsForPatient(req, res) {
        try {
            const { person_id } = req.user;
            const { allergy_name } = req.body;

            const newAllergy = await PatientAllergyService.insertPatientAllergyIfNotExists(person_id, allergy_name);

            return res.status(STATUS_CODES.CREATED).json({
                data: newAllergy,
                message: 'Patient allergy inserted successfully',
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientAllergyController.insertPatientAllergy: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Insert Patient Allergy',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPatientAllergyIfNotExistsForDoctor(req, res) {
        try {
            const { patient_id } = req.params;
            const { allergy_name } = req.body;
            
            const newAllergy = await PatientAllergyService.insertPatientAllergyIfNotExists(patient_id, allergy_name);

            return res.status(STATUS_CODES.CREATED).json({
                data: newAllergy,
                message: 'Patient allergy inserted successfully by doctor',
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientAllergyController.insertPatientAllergyForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Insert Patient Allergy by Doctor',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PatientAllergyController();