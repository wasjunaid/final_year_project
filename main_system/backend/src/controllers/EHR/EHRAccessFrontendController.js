const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { EHRAccessFrontendService } = require("../../services/EHR/EHRAccessFrontendService");

class EHRAccessFrontendController {
    /**
     * Get all EHR access requests for a patient with doctor details.
     * Returns data matching AccessRequestDto format for frontend.
     */
    async getAllEHRAccessForPatientIfExists(req, res) {
        try {
            const { person_id } = req.user;

            let ehrAccess = await EHRAccessFrontendService.getAllEHRAccessForPatientIfExistsForFrontend(person_id);
            if (!ehrAccess) {
                ehrAccess = [];
            }

            return res.status(STATUS_CODES.OK).json({
                data: ehrAccess,
                message: ehrAccess.length > 0 
                    ? 'EHR access retrieved successfully' 
                    : 'No EHR access records found for this patient',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRAccessFrontendController.getAllEHRAccessForPatientIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    /**
     * Get all EHR access requests for a doctor with patient details.
     * Returns data matching AccessRequestDto format for frontend.
     */
    async getAllEHRAccessForDoctorIfExists(req, res) {
        try {
            const { person_id } = req.user;

            let ehrAccess = await EHRAccessFrontendService.getAllEHRAccessForDoctorIfExistsForFrontend(person_id);
            if (!ehrAccess) {
                ehrAccess = [];
            }

            return res.status(STATUS_CODES.OK).json({
                data: ehrAccess,
                message: ehrAccess.length > 0 
                    ? 'EHR access retrieved successfully' 
                    : 'No EHR access records found for this doctor',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in EHRAccessFrontendController.getAllEHRAccessForDoctorIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new EHRAccessFrontendController();
