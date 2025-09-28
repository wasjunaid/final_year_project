const { statusCodes } = require("../../utils/statusCodesUtil");
const { SystemAdminService } = require("../../services/System/systemAdminService");

class SystemAdminController {
    async getAllSystemAdmins(req, res) {
        const { person_id } = req.user;

        try {
            const systemAdmins = await SystemAdminService.getAllSystemAdmins(person_id);

            return res.status(statusCodes.OK).json({
                data: systemAdmins,
                message: 'System admins retrieved successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error('Error fetching system admins:', error);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Error fetching system admins',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertSystemAdmin(req, res) {
        const { person_id } = req.user;
        const { email, role } = req.body;

        try {
            const newSystemAdmin = await SystemAdminService.insertSystemAdmin(person_id, {
                email,
                role
            });

            return res.status(statusCodes.CREATED).json({
                data: newSystemAdmin,
                message: 'System admin created successfully',
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error('Error creating system admin:', error);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Error creating system admin',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteSystemAdmin(req, res) {
        const { person_id } = req.user;
        const { system_admin_id } = req.params;

        try {
            await SystemAdminService.deleteSystemAdmin(person_id, system_admin_id);

            return res.status(statusCodes.OK).json({
                data: null,
                message: 'System admin deleted successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error('Error deleting system admin:', error);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Error deleting system admin',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new SystemAdminController();