const { pool } = require("../../config/databaseConfig");
const { PersonService } = require("../Person/PersonService");
const { validSystemAdminRoles } = require("../../database/system/systemAdminTableQuery");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");
const { superAdmin } = require("../../config/backendConfig");

class SystemAdminService {
    static async getSystemAdmin(person_id, role) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }
        if (!validSystemAdminRoles.includes(role)) {
            throw new AppError(`invalid role`, statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM system_admin
                WHERE
                system_admin_id = $1 AND role = $2`,
                values: [person_id, role]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("System admin not found", statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error getting system admin: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getAllSystemAdmins(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const checkSuperAdminExists = await this.checkSystemAdminExistsAgainstRole(person_id, 'super admin');
            if (!checkSuperAdminExists) {
                throw new AppError("Only super admins can get all system admins", statusCodes.BAD_REQUEST);
            }
            
            const query = {
                text: `SELECT * FROM system_admin`,
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No system admins found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting all system admins: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertSystemAdmin(person_id, {
        email,
        role
    }) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!email) {
            throw new AppError("email is required", statusCodes.BAD_REQUEST);
        }
        if (!password) {
            throw new AppError("password is required", statusCodes.BAD_REQUEST);
        }
        if (!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }
        if (!validSystemAdminRoles.includes(role)) {
            throw new AppError(`invalid role`, statusCodes.BAD_REQUEST);
        }

        try {
            const checkSuperAdminExists = await this.checkSystemAdminExistsAgainstRole(person_id, 'super admin');
            if (!checkSuperAdminExists) {
                throw new AppError("Only super admins can create new system admins", statusCodes.BAD_REQUEST);
            }

            const person = await PersonService.insertPersonIfNotExists(email);

            const query = {
                text: `INSERT INTO system_admin
                (system_admin_id, role)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [person.person_id, role]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error inserting system admin", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting system admin: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deleteSystemAdmin(person_id, system_admin_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!system_admin_id) {
            throw new AppError("system_admin_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const checkSuperAdminExists = await this.checkSystemAdminExistsAgainstRole(person_id, 'super admin');
            if (!checkSuperAdminExists) {
                throw new AppError("Only super admins can delete system admins", statusCodes.BAD_REQUEST);
            }

            const query = {
                text: `DELETE FROM system_admin
                WHERE
                system_admin_id = $1
                RETURNING *`,
                values: [system_admin_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error deleting system admin", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error deleting system admin: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkSystemAdminExistsAgainstRole(person_id, role) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM system_admin
                WHERE
                system_admin_id = $1 AND role = $2`,
                values: [person_id, role]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0].system_admin_id;
        } catch (error) {
            console.error(`Error checking system admin exists against role: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkSystemAdminExists(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM system_admin
                WHERE
                system_admin_id = $1`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0].system_admin_id;
        } catch (error) {
            console.error(`Error checking system admin exists: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

const createDefaultSuperAdmin = async () => {
    try {
        const person = await PersonService.insertPersonIfNotExists(superAdmin.email, superAdmin.password);

        const query = {
            text: `INSERT INTO system_admin
            (system_admin_id, role)
            VALUES ($1, $2)
            RETURNING *`,
            values: [person.person_id, 'super admin']
        };
        const result = await pool.query(query);
        if (result.rows.length === 0) {
            throw new AppError("Error creating default super admin", statusCodes.INTERNAL_SERVER_ERROR);
        }

        console.log("Default super admin created successfully");
    } catch (error) {
        console.error(`Error creating default super admin: ${error.message} ${error.status}`);
    }
}

module.exports = { SystemAdminService, createDefaultSuperAdmin };