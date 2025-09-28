const { statusCodes } = require("../../utils/statusCodesUtil");
const { HospitalAssociationRequestService } = require("../../services/Hospital/HospitalAssociationRequestService");

class HospitalAssociationRequestController {
    async getHospitalAssociationRequests(req, res) {
        const { hospital_id } = req.params;

        try {
            const requests = await HospitalAssociationRequestService.getHospitalAssociationRequests(hospital_id);

            return res.status(statusCodes.OK).json({
                data: requests,
                message: "Hospital association requests fetched successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getHospitalAssociationRequests: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching hospital association requests",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertHospitalAssociationRequest(req, res) {
        const { hospital_id, email, role } = req.body;

        try {
            const request = await HospitalAssociationRequestService.insertHospitalAssociationRequest(hospital_id, email, role);

            return res.status(statusCodes.CREATED).json({
                data: request,
                message: "Hospital association request created successfully",
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in insertHospitalAssociationRequest: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error creating hospital association request",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteHospitalAssociationRequest(req, res) {
        const { hospital_association_request_id } = req.params;

        try {
            await HospitalAssociationRequestService.deleteHospitalAssociationRequest(hospital_association_request_id);

            return res.status(statusCodes.OK).json({
                data: null,
                message: "Hospital association request deleted successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in deleteHospitalAssociationRequest: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error deleting hospital association request",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteHospitalAssociationRequestsByPersonIDAndRole(req, res) {
        const { person_id, role } = req.user;
        
        try {
            await HospitalAssociationRequestService.deleteHospitalAssociationRequestsByPersonIDAndRole(person_id, role);

            return res.status(statusCodes.OK).json({
                data: null,
                message: "Hospital association requests deleted successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in deleteHospitalAssociationRequestsByPersonIDAndRole: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error deleting hospital association requests",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async approveHospitalAssociationRequest(req, res) {
        const { hospital_association_request_id } = req.params;

        try {
            const approvedRequest = await HospitalAssociationRequestService.approveHospitalAssociationRequest(hospital_association_request_id);

            return res.status(statusCodes.OK).json({
                data: approvedRequest,
                message: "Hospital association request approved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in approveHospitalAssociationRequest: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error approving hospital association request",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new HospitalAssociationRequestController();