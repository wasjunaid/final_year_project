const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { SystemAdminService } = require("../../services/System/SystemAdminService");

class SystemAdminController {
    async getAllSystemAdminsIfExists(req, res) {
        try {
            const { search, is_active, is_verified } = req.query;

            const parseBooleanQuery = (value, fieldName) => {
                if (value === undefined || value === null || value === '') {
                    return undefined;
                }

                if (value === 'true') {
                    return true;
                }

                if (value === 'false') {
                    return false;
                }

                throw new AppError(`${fieldName} must be true or false`, STATUS_CODES.BAD_REQUEST);
            };

            if (search !== undefined && typeof search !== 'string') {
                throw new AppError('search must be a string', STATUS_CODES.BAD_REQUEST);
            }

            let systemAdmins = await SystemAdminService.getAllSystemAdminsIfExists({
                search: typeof search === 'string' ? search.trim() : undefined,
                is_active: parseBooleanQuery(is_active, 'is_active'),
                is_verified: parseBooleanQuery(is_verified, 'is_verified'),
            });

            if (!systemAdmins) {
                systemAdmins = [];
            }

            return res.status(STATUS_CODES.OK).json({
                data: systemAdmins,
                message: systemAdmins.length > 0 ? 'System admins retrieved successfully' : 'No system admins found',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in SystemAdminController.getAllSystemAdmins: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Error fetching system admins',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertSystemAdmin(req, res) {
        try {
            const { email } = req.body;

            const newSystemAdmin = await SystemAdminService.insertSystemAdmin(email);

            return res.status(STATUS_CODES.CREATED).json({
                data: newSystemAdmin,
                message: 'System admin created successfully',
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in SystemAdminController.insertSystemAdmin: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Error creating system admin',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteSystemAdmin(req, res) {
        try {
            const { system_admin_id } = req.params;

            await SystemAdminService.deleteSystemAdmin(system_admin_id);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: 'System admin deleted successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in SystemAdminController.deleteSystemAdmin: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Error deleting system admin',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateSystemAdminStatus(req, res) {
        try {
            const { person_id } = req.user;
            const { system_admin_id } = req.params;
            const { is_active } = req.body;

            if (typeof is_active !== 'boolean') {
                throw new AppError('is_active must be a boolean', STATUS_CODES.BAD_REQUEST);
            }

            const statusResult = await SystemAdminService.updateSystemAdminActiveStatus({
                actor_person_id: person_id,
                system_admin_id,
                is_active,
            });

            return res.status(STATUS_CODES.OK).json({
                data: statusResult,
                message: `System admin ${is_active ? 'activated' : 'deactivated'} successfully`,
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in SystemAdminController.updateSystemAdminStatus: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Error updating system admin status',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new SystemAdminController();