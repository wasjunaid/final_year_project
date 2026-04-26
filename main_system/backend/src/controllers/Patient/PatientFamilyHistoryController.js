const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { PatientFamilyHistoryService } = require("../../services/Patient/PatientFamilyHistoryService");

class PatientFamilyHistoryController {
    async getPatientFamilyHistoryIfExistsForPatient(req, res) {
        try {
            const { person_id } = req.user;

            const familyHistory = await PatientFamilyHistoryService.getPatientFamilyHistoryIfExists(person_id);
            if (!familyHistory || familyHistory.length === 0) {
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: 'No family history found for this patient',
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: familyHistory,
                message: 'Patient family history retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientFamilyHistoryController.getPatientFamilyHistoryIfExistsForPatient: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Patient Family History',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getPatientFamilyHistoryIfExistsForDoctor(req, res) {
        try {
            const { person_id } = req.params;

            const familyHistory = await PatientFamilyHistoryService.getPatientFamilyHistoryIfExists(person_id);
            if (!familyHistory || familyHistory.length === 0) {
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: 'No family history found for this patient',
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: familyHistory,
                message: 'Patient family history retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientFamilyHistoryController.getPatientFamilyHistoryIfExistsForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Patient Family History',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPatientFamilyHistoryIfNotExistsForPatient(req, res) {
        try {
            const { person_id } = req.user;
            const { condition_name } = req.body;

            const newFamilyHistory = await PatientFamilyHistoryService.insertPatientFamilyHistoryIfNotExists(person_id, condition_name);

            return res.status(STATUS_CODES.CREATED).json({
                data: newFamilyHistory,
                message: 'Patient family history inserted successfully',
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientFamilyHistoryController.insertPatientFamilyHistoryForPatient: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Insert Patient Family History',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPatientFamilyHistoryIfNotExistsForDoctor(req, res) {
        try {
            const { patient_id } = req.params;
            const { condition_name } = req.body;
            
            const newFamilyHistory = await PatientFamilyHistoryService.insertPatientFamilyHistoryIfNotExists(patient_id, condition_name);

            return res.status(STATUS_CODES.CREATED).json({
                data: newFamilyHistory,
                message: 'Patient family history inserted successfully by doctor',
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in PatientFamilyHistoryController.insertPatientFamilyHistoryForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Insert Patient Family History by Doctor',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PatientFamilyHistoryController();