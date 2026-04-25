const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { validateID } = require("../../utils/idUtil");
const { validateEmail } = require("../../utils/emailUtil");
const { validateRoleField } = require("../../validations/system/systemValidations");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const { PersonService } = require("../Person/PersonService");
const { LogService } = require("../Log/LogService");
const { superAdmin } = require("../../config/backendConfig");

class SystemAdminService {
    /**
     * Fetches a system admin by person ID if exists.
     * @param {number} person_id - The ID of the person.
     * @returns {Promise<object|boolean>} The system admin object if found, false otherwise.
     * @throws {AppError} if any issue occurs
     */
    static async getSystemAdminIfExists(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            person_id = validateID(person_id);

            const query = {
                text: `SELECT * FROM system_admin
                WHERE
                system_admin_id = $1`,
                values: [person_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in SystemAdminService.getSystemAdminIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches a system admin by person ID and role if exists.
     * @param {number} person_id - The ID of the person.
     * @param {string} role - The role of the system admin.
     * @returns {Promise<object|boolean>} The system admin object if found, false otherwise.
     * @throws {AppError} if any issue occurs
     */
    static async getSystemAdminAgainstRoleIfExists(person_id, role) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            person_id = validateID(person_id);

            ({ role } = validateRoleField(role));

            const query = {
                text: `SELECT * FROM system_admin
                WHERE
                system_admin_id = $1
                AND
                role = $2`,
                values: [person_id, role]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in SystemAdminService.getSystemAdminAgainstRoleIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all system admins.
     * @returns {Promise<Array>} Array of system admin objects.
     * @throws {AppError} if any issue occurs
     */
    static async getAllSystemAdminsIfExists(filters = {}) {
        try {        
            const conditions = [];
            const values = [];

            if (filters.search) {
                const searchValue = `%${filters.search.trim()}%`;
                values.push(searchValue);
                const searchIndex = values.length;
                conditions.push(`(
                    sa.system_admin_id::text ILIKE $${searchIndex}
                    OR p.email ILIKE $${searchIndex}
                    OR p.first_name ILIKE $${searchIndex}
                    OR p.last_name ILIKE $${searchIndex}
                    OR p.cnic ILIKE $${searchIndex}
                )`);
            }

            if (typeof filters.is_active === 'boolean') {
                values.push(!filters.is_active);
                conditions.push(`p.is_deleted = $${values.length}`);
            }

            if (typeof filters.is_verified === 'boolean') {
                values.push(filters.is_verified);
                conditions.push(`p.is_verified = $${values.length}`);
            }

            const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

            const query = {
                text: `
                SELECT sa.*,
                p.first_name,
                p.last_name,
                p.is_verified,
                p.is_deleted,
                p.cnic,
                p.email
                FROM system_admin sa
                JOIN person p ON sa.system_admin_id = p.person_id
                ${whereClause}`,
                values
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in SystemAdminService.getAllSystemAdminsIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new system admin.
     * @param {string} email - The email of the person to be made system admin.
     * @returns {Promise<object>} The inserted system admin object.
     * @throws {AppError} if any issue occurs
     */
    static async insertSystemAdmin(email) {
        try {
            if (!email) {
                throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
            }

            email = validateEmail(email);

            const person = await PersonService.insertPersonIfNotExists(email);

            const query = {
                text: `INSERT INTO system_admin
                (system_admin_id, role)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [person.person_id, VALID_ROLES_OBJECT.ADMIN]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error inserting system admin", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in SystemAdminService.insertSystemAdmin: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Deletes a system admin by ID.
     * @param {number} system_admin_id - The ID of the system admin to delete.
     * @returns {Promise<boolean>} True if the deletion was successful
     * @throws {AppError} if any issue occurs
     */
    static async deleteSystemAdmin(system_admin_id) {
        try {
            if (!system_admin_id) {
                throw new AppError("system_admin_id is required", STATUS_CODES.BAD_REQUEST);
            }

            system_admin_id = validateID(system_admin_id);

            const query = {
                text: `DELETE FROM system_admin
                WHERE
                system_admin_id = $1
                AND
                role != '${VALID_ROLES_OBJECT.SUPER_ADMIN}'
                RETURNING *`,
                values: [system_admin_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error deleting system admin", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in SystemAdminService.deleteSystemAdmin: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Updates system admin active status (soft deactivation via person.is_deleted).
     * @param {object} params
     * @param {number|string} params.actor_person_id - super admin performing the action
     * @param {number|string} params.system_admin_id - target system admin id
     * @param {boolean} params.is_active - desired active state
     * @returns {Promise<object>}
     */
    static async updateSystemAdminActiveStatus({ actor_person_id, system_admin_id, is_active }) {
        try {
            if (!actor_person_id) {
                throw new AppError("actor_person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!system_admin_id) {
                throw new AppError("system_admin_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof is_active !== "boolean") {
                throw new AppError("is_active must be a boolean", STATUS_CODES.BAD_REQUEST);
            }

            actor_person_id = validateID(actor_person_id);
            system_admin_id = validateID(system_admin_id);

            const targetSystemAdmin = await this.getSystemAdminIfExists(system_admin_id);
            if (!targetSystemAdmin) {
                throw new AppError("System admin not found", STATUS_CODES.NOT_FOUND);
            }

            if (targetSystemAdmin.role === VALID_ROLES_OBJECT.SUPER_ADMIN) {
                throw new AppError("Super admin cannot be deactivated", STATUS_CODES.FORBIDDEN);
            }

            if (!is_active && actor_person_id === system_admin_id) {
                throw new AppError("Cannot deactivate yourself", STATUS_CODES.FORBIDDEN);
            }

            const query = {
                text: `UPDATE person
                SET is_deleted = $1
                WHERE person_id = $2
                RETURNING person_id, email, is_deleted`,
                values: [!is_active, system_admin_id],
            };

            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to update system admin status", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            try {
                await LogService.insertLog(actor_person_id, `System admin ${system_admin_id} ${is_active ? "activated" : "deactivated"}`);
            } catch (logError) {
                console.error(`System admin status update log failed: ${logError.message}`);
            }

            return {
                system_admin_id,
                is_active,
                is_deleted: !is_active,
            };
        } catch (error) {
            console.error(`Error in SystemAdminService.updateSystemAdminActiveStatus: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

const createDefaultSuperAdmin = async () => {
    try {
        const person = await PersonService.insertPersonIfNotExists(superAdmin.email, superAdmin.password, { first_name: 'super', last_name: 'admin', is_verified: true });


        const query = {
            text: `INSERT INTO system_admin
            (system_admin_id, role)
            VALUES ($1, $2)
            ON CONFLICT (system_admin_id)
            DO
            UPDATE
            SET
            role = EXCLUDED.role
            RETURNING *`,
            values: [person.person_id, 'super admin']
        };
        const result = await DatabaseService.query(query.text, query.values);
        if (result.rowCount === 0) {
            throw new AppError("Error creating default super admin", STATUS_CODES.INTERNAL_SERVER_ERROR);
        }

        console.log("Default super admin created successfully");
    } catch (error) {
        console.error(`Error creating default super admin: ${error.message} ${error.status}`);
        throw error;
    }
}

module.exports = { SystemAdminService, createDefaultSuperAdmin };