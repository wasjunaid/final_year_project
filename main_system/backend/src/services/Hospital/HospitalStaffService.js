const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PersonService } = require("../Person/PersonService");
const { SystemAdminService } = require("../System/SystemAdminService");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const { VALID_HOSPITAL_STAFF_ROLES } = require("../../utils/validConstantsUtil");
const { LogService } = require("../Log/LogService");

class HospitalStaffService {
    /**
     * Gets hospital staff details if exists.
     * @param {number} person_id - The ID of the person.
     * @returns {Promise<object|boolean>} The hospital staff object if exists, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getHospitalStaffIfExists(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM hospital_staff_view
                WHERE
                hospital_staff_id = $1`,
                values: [person_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalStaff.getHospitalStaffIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Gets hospital staff details if exists.
     * @param {number} person_id - The ID of the person.
     * @returns {Promise<object|boolean>} The hospital staff object if exists, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getHospitalStaffIfExistsForFrontend(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT 
                    hs.*,
                    p.email as person_email,
                    hs.created_at
                FROM hospital_staff hs
                INNER JOIN person p ON hs.hospital_staff_id = p.person_id
                WHERE hs.hospital_staff_id = $1`,
                values: [person_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalStaff.getHospitalStaffIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Gets all hospital staff for a hospital if the requester has permission.
     * @param {number} person_id - The ID of the requester.
     * @returns {Promise<object[]|boolean>} An array of hospital staff objects if exists, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAllHospitalStaffIfExists(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const hospitalStaff = await this.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("Only hospital staff can get hospital staff", STATUS_CODES.FORBIDDEN);
            }

            const query = {
                text: `SELECT * FROM hospital_staff_view
                WHERE
                hospital_id = $1`,
                values: [hospitalStaff.hospital_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalStaffService.getAllHospitalStaffIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Gets all hospital staff for a hospital if the requester has permission.
     * @param {number} person_id - The ID of the requester.
     * @returns {Promise<object[]|boolean>} An array of hospital staff objects if exists, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAllHospitalStaffIfExistsForFrontend(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const hospitalStaff = await this.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("Only hospital staff can get hospital staff", STATUS_CODES.FORBIDDEN);
            }

            // Updated query to explicitly include email and created_at
            const query = {
                text: `SELECT 
                    hs.*,
                    p.email as person_email,
                    p.first_name,
                    p.last_name,
                    p.is_verified,
                    p.updated_at,
                    h.name as hospital_name,
                    hs.created_at
                FROM hospital_staff hs
                INNER JOIN person p ON hs.hospital_staff_id = p.person_id
                LEFT JOIN hospital h ON hs.hospital_id = h.hospital_id
                WHERE hs.hospital_id = $1
                ORDER BY hs.created_at DESC`,
                values: [hospitalStaff.hospital_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalStaffService.getAllHospitalStaffIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Gets all hospital admins in the system.
     * @returns {Promise<object[]|boolean>} An array of hospital admin objects if exists, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAllHospitalAdminsIfExists() {
        try {
            const query = {
                text: `SELECT * FROM hospital_staff_view
                WHERE
                role = '${VALID_ROLES_OBJECT.HOSPITAL_ADMIN}'`,
            };
            const result = await DatabaseService.query(query.text);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalStaffService.getAllHospitalAdmins: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Gets all hospital admins in the system.
     * @returns {Promise<object[]>} An array of hospital admin objects (empty array if none exist).
     * @throws {AppError} if any issue occurs
     */
    static async getAllHospitalAdminsIfExistsForFrontend(filters = {}) {
        try {
            const conditions = ['hs.role = $1'];
            const values = [VALID_ROLES_OBJECT.HOSPITAL_ADMIN];

            if (filters.search) {
                const searchValue = `%${filters.search.trim()}%`;
                values.push(searchValue);
                const searchIndex = values.length;
                conditions.push(`(
                    hs.hospital_staff_id::text ILIKE $${searchIndex}
                    OR p.email ILIKE $${searchIndex}
                    OR p.first_name ILIKE $${searchIndex}
                    OR p.last_name ILIKE $${searchIndex}
                    OR p.cnic ILIKE $${searchIndex}
                    OR h.name ILIKE $${searchIndex}
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

            const whereClause = `WHERE ${conditions.join(' AND ')}`;

            // Updated query to include email and created_at
            const query = {
                text: `SELECT 
                    hs.*,
                    p.email as person_email,
                    p.first_name,
                    p.last_name,
                    p.cnic,
                    p.date_of_birth,
                    p.gender,
                    p.is_verified,
                    p.is_deleted,
                    h.name as hospital_name,
                    hs.created_at
                FROM hospital_staff hs
                INNER JOIN person p ON hs.hospital_staff_id = p.person_id
                LEFT JOIN hospital h ON hs.hospital_id = h.hospital_id
                ${whereClause}
                ORDER BY hs.created_at DESC`,
                values
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalStaffService.getAllHospitalAdmins: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new hospital staff member.
     * @param {object} params - The hospital staff details.
     * @param {number} params.person_id - The ID of the person adding the staff.
     * @param {string} params.email - The email of the new staff member.
     * @param {number} params.hospital_id - The ID of the hospital.
     * @param {string} params.role - The role of the new staff member.
     * @returns {Promise<object>} The newly created hospital staff object if successful.
     * @throws {AppError} if any issue occurs
     */
    static async insertHospitalStaff({person_id, email, hospital_id, role}) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!email) {
                throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!VALID_HOSPITAL_STAFF_ROLES.includes(role)) {
                throw new AppError(`invalid role`, STATUS_CODES.BAD_REQUEST);
            }

            let hospitalStaff;
            const checkSystemAdminExists = await SystemAdminService.getSystemAdminAgainstRoleIfExists(person_id, VALID_ROLES_OBJECT.SUPER_ADMIN);
            if (!checkSystemAdminExists) {
                hospitalStaff = await this.getHospitalStaffIfExists(person_id);
                if (!hospitalStaff) {
                    throw new AppError("Only hospital staff can add new hospital staff", STATUS_CODES.FORBIDDEN);
                }

                if (hospitalStaff.hospital_id !== hospital_id) {
                    throw new AppError("Cannot add hospital staff to another hospital", STATUS_CODES.FORBIDDEN);
                }

                if (role === VALID_ROLES_OBJECT.HOSPITAL_ADMIN) {
                    throw new AppError("Only system super admin can add hospital admin", STATUS_CODES.FORBIDDEN);
                }

                if (hospitalStaff.role === VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN && role === VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN) {
                    throw new AppError("Hospital sub admin cannot add another hospital sub admin", STATUS_CODES.FORBIDDEN);
                }
            }

            const person = await PersonService.insertPersonIfNotExists(email);

            const query = {
                text: `INSERT INTO hospital_staff
                (hospital_staff_id, hospital_id, role)
                VALUES
                ($1, $2, $3)
                RETURNING *`,
                values: [person.person_id, hospital_id, role]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error inserting hospital staff", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting hospital staff: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Deletes a hospital staff member.
     * @param {number} person_id - The ID of the person performing the deletion.
     * @param {number} hospital_staff_id - The ID of the hospital staff member to delete.
     * @returns {Promise<boolean>} True if deletion was successful.
     * @throws {AppError} if any issue occurs
     */
    static async deleteHospitalStaff(person_id, hospital_staff_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!hospital_staff_id) {
                throw new AppError("hospital_staff_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (hospital_staff_id === person_id) {
                throw new AppError("Cannot delete yourself", STATUS_CODES.FORBIDDEN);
            }

            const deleteStaffCheck = await this.getHospitalStaffIfExists(hospital_staff_id);
            if (!deleteStaffCheck) {
                throw new AppError("Hospital staff to delete not found", STATUS_CODES.NOT_FOUND);
            }

            const superAdmin = await SystemAdminService.getSystemAdminAgainstRoleIfExists(person_id, VALID_ROLES_OBJECT.SUPER_ADMIN);
            if (!superAdmin) {
                const hospitalStaff = await this.getHospitalStaffIfExists(person_id);
                if (!hospitalStaff) {
                    throw new AppError("Only hospital staff can delete hospital staff", STATUS_CODES.FORBIDDEN);
                }

                if (hospitalStaff.hospital_id !== deleteStaffCheck.hospital_id) {
                    throw new AppError("Cannot delete hospital staff from another hospital", STATUS_CODES.FORBIDDEN);
                }

                if (deleteStaffCheck.role === VALID_ROLES_OBJECT.HOSPITAL_ADMIN) {
                    throw new AppError("Hospital admin cannot be deleted", STATUS_CODES.FORBIDDEN);
                }

                if (hospitalStaff.role === VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN && deleteStaffCheck.role === VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN) {
                    throw new AppError("Hospital sub admin cannot delete another hospital sub admin", STATUS_CODES.FORBIDDEN);
                }
            } else {
                if (deleteStaffCheck.role !== VALID_ROLES_OBJECT.HOSPITAL_ADMIN) {
                    throw new AppError("super admin can only delete hospital admin", STATUS_CODES.FORBIDDEN);
                }
            }

            const query = {
                text: `DELETE FROM hospital_staff
                WHERE
                hospital_staff_id = $1
                RETURNING *`,
                values: [hospital_staff_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error deleting hospital staff", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in HospitalStaffService.deleteHospitalStaff: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Updates hospital staff active status (soft deactivation via person.is_deleted).
     * @param {object} params
     * @param {number|string} params.actor_person_id
     * @param {number|string} params.hospital_staff_id
     * @param {boolean} params.is_active
     * @returns {Promise<object>}
     */
    static async updateHospitalStaffActiveStatus({ actor_person_id, hospital_staff_id, is_active }) {
        try {
            if (!actor_person_id) {
                throw new AppError("actor_person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!hospital_staff_id) {
                throw new AppError("hospital_staff_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof is_active !== "boolean") {
                throw new AppError("is_active must be a boolean", STATUS_CODES.BAD_REQUEST);
            }

            if (Number(actor_person_id) === Number(hospital_staff_id) && !is_active) {
                throw new AppError("Cannot deactivate yourself", STATUS_CODES.FORBIDDEN);
            }

            const target = await this.getHospitalStaffIfExists(hospital_staff_id);
            if (!target) {
                throw new AppError("Hospital staff not found", STATUS_CODES.NOT_FOUND);
            }

            const superAdmin = await SystemAdminService.getSystemAdminAgainstRoleIfExists(actor_person_id, VALID_ROLES_OBJECT.SUPER_ADMIN);
            if (!superAdmin) {
                const actorStaff = await this.getHospitalStaffIfExists(actor_person_id);
                if (!actorStaff) {
                    throw new AppError("Only hospital staff can update hospital staff status", STATUS_CODES.FORBIDDEN);
                }

                if (actorStaff.hospital_id !== target.hospital_id) {
                    throw new AppError("Cannot update status of hospital staff from another hospital", STATUS_CODES.FORBIDDEN);
                }

                if (target.role === VALID_ROLES_OBJECT.HOSPITAL_ADMIN) {
                    throw new AppError("Only super admin can update hospital admin status", STATUS_CODES.FORBIDDEN);
                }

                if (actorStaff.role === VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN && target.role === VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN) {
                    throw new AppError("Hospital sub admin cannot update another hospital sub admin status", STATUS_CODES.FORBIDDEN);
                }
            } else {
                if (target.role !== VALID_ROLES_OBJECT.HOSPITAL_ADMIN) {
                    throw new AppError("Super admin can only update hospital admin status", STATUS_CODES.FORBIDDEN);
                }
            }

            const query = {
                text: `UPDATE person
                SET is_deleted = $1
                WHERE person_id = $2
                RETURNING person_id, is_deleted`,
                values: [!is_active, hospital_staff_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to update hospital staff status", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            try {
                await LogService.insertLog(actor_person_id, `Hospital staff ${hospital_staff_id} ${is_active ? "activated" : "deactivated"}`);
            } catch (logError) {
                console.error(`Hospital staff status update log failed: ${logError.message}`);
            }

            return {
                hospital_staff_id,
                is_active,
                is_deleted: !is_active,
            };
        } catch (error) {
            console.error(`Error in HospitalStaffService.updateHospitalStaffActiveStatus: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { HospitalStaffService };