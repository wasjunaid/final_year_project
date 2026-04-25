const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { UserService } = require("../User/UserService");
const { superAdmin } = require("../../config/backendConfig");

class SuperAdminService {
    static async getSuperAdminIfExists(super_admin_id) {
        try{
            if (!super_admin_id) {
                throw new AppError("super_admin_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM super_admin
                WHERE
                super_admin_id = $1`,
                values: [super_admin_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in SuperAdminService.getSuperAdminIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

const createDefaultSuperAdmin = async () => {
    try {
        const user = await UserService.insertUserIfNotExists(superAdmin.email, superAdmin.password);

        const query = {
            text: `INSERT INTO super_admin
            (super_admin_id)
            VALUES
            ($1)
            ON CONFLICT (super_admin_id) DO NOTHING`,
            values: [user.user_id]
        };
        const result = await DatabaseService.query(query.text, query.values);
        if (result.rowCount === 0) {
            console.log("Default super admin already exists");
            return;
        }

        console.log("Default super admin created");
    } catch (error) {
        console.error(`Error in createDefaultSuperAdmin: ${error.message} ${error.status}`);
        throw error;
    }
}

module.exports = { SuperAdminService, createDefaultSuperAdmin };