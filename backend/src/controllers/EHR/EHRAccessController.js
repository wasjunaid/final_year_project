const { statusCodes } = require("../../utils/statusCodesUtil");
const { EHRAccessService } = require("../../services/EHR/EHRAccessService");

class EHRAccessController {
    async getEHRAccessForPatient(req, res) {
        const { person_id } = req.user;

        try {
            const ehrAccess = await EHRAccessService.getEHRAccessForPatient(person_id);

            return res.status(statusCodes.OK).json({
                data: ehrAccess,
                message: 'EHR access retrieved successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getEHRAccessForPatient: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getEHRAccessForDoctor(req, res) {
        const { person_id } = req.user;

        try {
            const ehrAccess = await EHRAccessService.getEHRAccessForDoctor(person_id);

            return res.status(statusCodes.OK).json({
                data: ehrAccess,
                message: 'EHR access retrieved successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getEHRAccessForDoctor: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertEHRAccess(req, res) {
        const { person_id } = req.user;
        const { doctor_id } = req.body;

        try {
            const ehrAccess = await EHRAccessService.insertEHRAccess(person_id, doctor_id);

            return res.status(statusCodes.CREATED).json({
                data: ehrAccess,
                message: 'EHR access granted successfully',
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in insertEHRAccess: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async grantEHRAccess(req, res) {
        const { person_id } = req.user;
        const { ehr_access_id } = req.params;

        try {
            const ehrAccess = await EHRAccessService.grantEHRAccess(person_id, ehr_access_id);

            return res.status(statusCodes.OK).json({
                data: ehrAccess,
                message: 'EHR access granted successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in grantEHRAccess: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async revokeEHRAccess(req, res) {
        const { person_id } = req.user;
        const { ehr_access_id } = req.params;

        try {
            const ehrAccess = await EHRAccessService.revokeEHRAccess(person_id, ehr_access_id);

            return res.status(statusCodes.OK).json({
                data: ehrAccess,
                message: 'EHR access revoked successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in revokeEHRAccess: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Internal Server Error',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new EHRAccessController();