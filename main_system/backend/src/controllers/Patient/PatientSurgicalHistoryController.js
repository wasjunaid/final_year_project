const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PatientSurgicalHistoryService } = require("../../services/Patient/PatientSurgicalHistoryService");

class PatientSurgicalHistoryController {
    async getPatientSurgicalHistoryIfExistsForPatient(req, res) {
        try {
            const { person_id } = req.user;

            const surgicalHistory = await PatientSurgicalHistoryService.getPatientSurgicalHistoryIfExists(person_id);
            if (!surgicalHistory || surgicalHistory.length === 0) {
                // throw new AppError('No surgical history found for the patient', STATUS_CODES.NOT_FOUND);
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: 'No surgical history found for this patient',
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: surgicalHistory,
                message: 'Patient surgical history retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientSurgicalHistoryController.getPatientSurgicalHistoryIfExistsForPatient: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Patient Surgical History',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getPatientSurgicalHistoryIfExistsForDoctor(req, res) {
        try {
            const { person_id } = req.params;

            const surgicalHistory = await PatientSurgicalHistoryService.getPatientSurgicalHistoryIfExists(person_id);
            if (!surgicalHistory || surgicalHistory.length === 0) {
                // throw new AppError('No surgical history found for the patient', STATUS_CODES.NOT_FOUND);
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: 'No surgical history found for this patient',
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: surgicalHistory,
                message: 'Patient surgical history retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientSurgicalHistoryController.getPatientSurgicalHistoryIfExistsForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Patient Surgical History',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPatientSurgicalHistoryIfNotExistsForPatient(req, res) {
        try {
            const { person_id } = req.user;
            const { surgery_name, surgery_date } = req.body;

            const newSurgicalHistory = await PatientSurgicalHistoryService.insertPatientSurgicalHistoryIfNotExists(person_id, surgery_name, surgery_date);

            return res.status(STATUS_CODES.CREATED).json({
                data: newSurgicalHistory,
                message: 'Patient surgical history inserted successfully',
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientSurgicalHistoryController.insertPatientSurgicalHistory: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Insert Patient Surgical History',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPatientSurgicalHistoryIfNotExistsForDoctor(req, res) {
        try {
            const { patient_id } = req.params;
            const { surgery_name, surgery_date } = req.body;
            
            const newSurgicalHistory = await PatientSurgicalHistoryService.insertPatientSurgicalHistoryIfNotExists(patient_id, surgery_name, surgery_date);

            return res.status(STATUS_CODES.CREATED).json({
                data: newSurgicalHistory,
                message: 'Patient surgical history inserted successfully by doctor',
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientSurgicalHistoryController.insertPatientSurgicalHistoryForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Insert Patient Surgical History by Doctor',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PatientSurgicalHistoryController();