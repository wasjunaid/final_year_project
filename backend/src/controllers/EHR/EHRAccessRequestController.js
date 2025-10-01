const { statusCodes } = require("../../utils/statusCodesUtil");
const { EHRAccessRequestService } = require("../../services/EHR/EHRAccessRequestService");

class EHRAccessRequestController {
    async getEHRAccessRequest(req, res) {
        const { person_id } = req.user;
        const { patient_id } = req.body;

        try {
            const ehrAccessRequest = await EHRAccessRequestService.getEHRAccessRequest(person_id, patient_id);

            return res.status(statusCodes.OK).json({
                data: ehrAccessRequest,
                message: "EHR access request retrieved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`error in getEHRAccessRequest ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getEHRAccessRequestsForPatient(req, res) {
        const { person_id } = req.user;

        try {
            const ehrAccessRequests = await EHRAccessRequestService.getEHRAccessRequestsForPatient(person_id);

            return res.status(statusCodes.OK).json({
                data: ehrAccessRequests,
                message: "EHR access requests for patient retrieved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`error in getEHRAccessRequestsForPatient ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getEHRAccessRequestsForDoctor(req, res) {
        const { person_id } = req.user;

        try {
            const ehrAccessRequests = await EHRAccessRequestService.getEHRAccessRequestsForDoctor(person_id);

            return res.status(statusCodes.OK).json({
                data: ehrAccessRequests,
                message: "EHR access requests for doctor retrieved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`error in getEHRAccessRequestsForDoctor ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertEHRAccessRequest(req, res) {
        const { person_id } = req.user;
        const { patient_id } = req.body;

        try {
            const newRequest = await EHRAccessRequestService.insertEHRAccessRequest(person_id, patient_id);

            return res.status(statusCodes.CREATED).json({
                data: newRequest,
                message: "EHR access request created successfully",
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`error in insertEHRAccessRequest ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async approveEHRAccessRequest(req, res) {
        const { person_id } = req.user;
        const { ehr_access_request_id } = req.params;

        try {
            const updatedRequest = await EHRAccessRequestService.approveEHRAccessRequest(person_id, ehr_access_request_id);

            return res.status(statusCodes.OK).json({
                data: updatedRequest,
                message: "EHR access request approved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`error in approveEHRAccessRequest ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async denyEHRAccessRequest(req, res) {
        const { person_id } = req.user;
        const { ehr_access_request_id } = req.params;

        try {
            const updatedRequest = await EHRAccessRequestService.denyEHRAccessRequest(person_id, ehr_access_request_id);

            return res.status(statusCodes.OK).json({
                data: updatedRequest,
                message: "EHR access request denied successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`error in denyEHRAccessRequest ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async revokeEHRAccessRequest(req, res) {
        const { person_id } = req.user;
        const { ehr_access_request_id } = req.params;

        try {
            const updatedRequest = await EHRAccessRequestService.revokeEHRAccessRequest(person_id, ehr_access_request_id);

            return res.status(statusCodes.OK).json({
                data: updatedRequest,
                message: "EHR access request revoked successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`error in revokeEHRAccessRequest ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new EHRAccessRequestController();