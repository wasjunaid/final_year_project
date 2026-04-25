const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { HospitalAssociationRequestFrontendService } = require("../../services/Hospital/HospitalAssociationRequestFrontendService");

class HospitalAssociationRequestFrontendController {
    /**
     * Get hospital association requests for a person (doctor/medical coder) with hospital details.
     * Returns data matching PersonAssociationRequestDto format for frontend.
     */
    async getHospitalAssociationRequestsForPersonIfExists(req, res) {
        try {
            const { person_id, role } = req.user;

            let requests = await HospitalAssociationRequestFrontendService.getHospitalAssociationRequestsForPersonIfExistsForFrontend(person_id, role);
            if (!requests) {
                requests = [];
            }

            return res.status(STATUS_CODES.OK).json({
                data: requests,
                message: requests.length > 0 
                    ? "Hospital association requests for person fetched successfully" 
                    : "No hospital association requests found for person",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestFrontendController.getHospitalAssociationRequestsForPersonIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching hospital association requests for person",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    /**
     * Get hospital association requests for hospital staff with person details.
     * Returns data matching HospitalAssociationRequestDto format for frontend.
     */
    async getHospitalAssociationRequestsForHospitalStaffIfExists(req, res) {
        try {
            const { person_id } = req.user;

            let requests = await HospitalAssociationRequestFrontendService.getHospitalAssociationRequestsForHospitalStaffIfExistsForFrontend(person_id);
            if (!requests) {
                requests = [];
            }

            return res.status(STATUS_CODES.OK).json({
                data: requests,
                message: requests.length > 0 
                    ? "Hospital association requests fetched successfully" 
                    : "No hospital association requests found for hospital staff",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestFrontendController.getHospitalAssociationRequestsForHospitalStaffIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching hospital association requests",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new HospitalAssociationRequestFrontendController();
