const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PatientMedicalHistoryService } = require("../../services/Patient/PatientMedicalHistoryService");

class PatientMedicalHistoryController {
    async getPatientMedicalHistoryIfExistsForPatient(req, res) {
        try {
            const { person_id } = req.user;

            const medicalHistory = await PatientMedicalHistoryService.getPatientMedicalHistoryIfExists(person_id);
            if (!medicalHistory || medicalHistory.length === 0) {
                // throw new AppError('No medical history found for the patient', STATUS_CODES.NOT_FOUND);
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: 'No medical history found for this patient',
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: medicalHistory,
                message: 'Patient medical history retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientMedicalHistoryController.getPatientMedicalHistoryIfExistsForPatient: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Patient Medical History',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getPatientMedicalHistoryIfExistsForDoctor(req, res) {
        try {
            const { person_id } = req.params;

            const medicalHistory = await PatientMedicalHistoryService.getPatientMedicalHistoryIfExists(person_id);
            if (!medicalHistory || medicalHistory.length === 0) {
                // throw new AppError('No medical history found for the patient', STATUS_CODES.NOT_FOUND);
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: 'No medical history found for this patient',
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: medicalHistory,
                message: 'Patient medical history retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientMedicalHistoryController.getPatientMedicalHistoryIfExistsForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Patient Medical History',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPatientMedicalHistoryIfNotExistsForPatient(req, res) {
        try {
            const { person_id } = req.user;
            const { condition_name, diagnosis_date } = req.body;

            const newMedicalHistory = await PatientMedicalHistoryService.insertPatientMedicalHistoryIfNotExists(person_id, condition_name, diagnosis_date);

            return res.status(STATUS_CODES.CREATED).json({
                data: newMedicalHistory,
                message: 'Patient medical history inserted successfully',
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientMedicalHistoryController.insertPatientMedicalHistoryIfNotExistsForPatient: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Insert Patient Medical History',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPatientMedicalHistoryIfNotExistsForDoctor(req, res) {
        try {
            const { patient_id } = req.params;
            const { condition_name, diagnosis_date } = req.body;

            const newMedicalHistory = await PatientMedicalHistoryService.insertPatientMedicalHistoryIfNotExists(patient_id, condition_name, diagnosis_date);

            return res.status(STATUS_CODES.CREATED).json({
                data: newMedicalHistory,
                message: 'Patient medical history inserted successfully by doctor',
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientMedicalHistoryController.insertPatientMedicalHistoryIfNotExistsForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Insert Patient Medical History by Doctor',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PatientMedicalHistoryController();