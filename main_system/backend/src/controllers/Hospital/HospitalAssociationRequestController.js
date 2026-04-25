const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { HospitalAssociationRequestService } = require("../../services/Hospital/HospitalAssociationRequestService");
const { validateEmail } = require("../../utils/emailUtil");
const { validateID } = require("../../utils/idUtil");

class HospitalAssociationRequestController {
    async getHospitalAssociationRequestsForPersonIfExists(req, res) {
        try {
            const { person_id, role } = req.user;

            let requests = await HospitalAssociationRequestService.getHospitalAssociationRequestsForPersonIfExistsForFrontend(person_id, role);
            if (!requests) {
                // throw new AppError("No hospital association requests found for person", STATUS_CODES.NOT_FOUND);
                requests = [];
            }

            return res.status(STATUS_CODES.OK).json({
                data: requests,
                // message: "Hospital association requests for person fetched successfully",
                message: requests.length > 0 ? "Hospital association requests for person fetched successfully" : "No hospital association requests found for person",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestController.getHospitalAssociationRequestsForPersonIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching hospital association requests for person",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getHospitalAssociationRequestsForHospitalStaffIfExists(req, res) {
        try {
            const { person_id } = req.user;

            let requests = await HospitalAssociationRequestService.getHospitalAssociationRequestsForHospitalStaffIfExists(person_id);
            if (!requests) {
                // throw new AppError("No hospital association requests found for hospital staff", STATUS_CODES.NOT_FOUND);
                requests = [];
            }

            return res.status(STATUS_CODES.OK).json({
                data: requests,
                // message: "Hospital association requests fetched successfully",
                message: requests.length > 0 ? "Hospital association requests fetched successfully" : "No hospital association requests found for hospital staff",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestController.getHospitalAssociationRequestsForHospitalStaffIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching hospital association requests",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertHospitalAssociationRequest(req, res) {
        try {
            const { person_id } = req.user;
            const { email, role } = req.body;

            if (!email) {
                throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof email !== 'string') {
                throw new AppError("email must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const validatedEmail = validateEmail(email);

            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof role !== 'string') {
                throw new AppError("role must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedRole = role.trim().toLowerCase();

            const request = await HospitalAssociationRequestService.insertHospitalAssociationRequest({ person_id, email: validatedEmail, role: normalizedRole });

            return res.status(STATUS_CODES.CREATED).json({
                data: request,
                message: "Hospital association request created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestController.insertHospitalAssociationRequest: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error creating hospital association request",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteHospitalAssociationRequestForHospitalStaff(req, res) {
        
        try {
            const { person_id } = req.user;
            const { hospital_association_request_id } = req.params;

            if (!hospital_association_request_id) {
                throw new AppError("hospital_association_request_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalAssociationRequestID = validateID(hospital_association_request_id);

            await HospitalAssociationRequestService.deleteHospitalAssociationRequestForHospitalStaff(person_id, validatedHospitalAssociationRequestID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Hospital association request deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestController.deleteHospitalAssociationRequestForHospitalStaff: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error deleting hospital association request",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteHospitalAssociationRequestForPerson(req, res) {        
        try {
            const { person_id } = req.user;
            const { hospital_association_request_id } = req.params;

            if (!hospital_association_request_id) {
                throw new AppError("hospital_association_request_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalAssociationRequestID = validateID(hospital_association_request_id);

            await HospitalAssociationRequestService.deleteHospitalAssociationRequestForPerson(person_id, validatedHospitalAssociationRequestID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Hospital association requests deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestController.deleteHospitalAssociationRequestForPerson: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error deleting hospital association requests",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteAllHospitalAssociationRequestsForPerson(req, res) {
        try {
            const { person_id, role } = req.user;

            await HospitalAssociationRequestService.deleteAllHospitalAssociationRequestsForPerson(person_id, role);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "All hospital association requests for person deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestController.deleteAllHospitalAssociationRequestForPerson: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error deleting all hospital association requests for person",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async acceptHospitalAssociationRequest(req, res) {
        try {
            const { person_id } = req.user;
            const { hospital_association_request_id } = req.params;

            if (!hospital_association_request_id) {
                throw new AppError("hospital_association_request_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalAssociationRequestID = validateID(hospital_association_request_id);

            const acceptedRequest = await HospitalAssociationRequestService.acceptHospitalAssociationRequest(person_id, validatedHospitalAssociationRequestID);

            return res.status(STATUS_CODES.OK).json({
                data: acceptedRequest,
                message: "Hospital association request accepted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestController.acceptHospitalAssociationRequest: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error accepting hospital association request",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new HospitalAssociationRequestController();