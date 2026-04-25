const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { UserService } = require("../User/UserService");
const { SuperAdminService } = require("../System/SuperAdminService");
const { VALID_ROLES_OBJECT, VALID_INSURANCE_STAFF_ROLES } = require("../../utils/validConstantsUtil");
const { validateEmail } = require("../../utils/emailUtil");

class InsuranceStaffService {
    /**
     * gets insurance staff using insurance_staff_id
     * @param {number} insurance_staff_id id of the insurance staff
     * @returns {Promise<Object|boolean>} returns insurance staff object if exists, else false
     * @throws {AppError} if any error occurs
     */
    static async getInsuranceStaffIfExists(insurance_staff_id) {
        try{
            if (!insurance_staff_id) {
                throw new AppError("insurance_staff_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM insurance_staff_view
                WHERE
                insurance_staff_id = $1`,
                values: [insurance_staff_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsuranceStaffService.getInsuranceStaffIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * gets all insurance staff
     * @param {number} insurance_staff_id id of the insurance staff
     * @returns {Promise<Array|boolean>} returns array of insurance staff objects if exists, else false
     * @throws {AppError} if any error occurs
     */
    static async getAllInsuranceStaffIfExists(insurance_staff_id) {
        try {
            if (!insurance_staff_id) {
                throw new AppError("insurance_staff_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await this.getInsuranceStaffIfExists(insurance_staff_id);
            if (!staff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `SELECT * FROM insurance_staff_view
                WHERE
                insurance_company_id = $1`,
                values: [staff.insurance_company_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in InsuranceStaffService.getAllInsuranceStaffIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * gets all insurance staff for super admin
     * @returns {Promise<Array|boolean>} returns array of insurance staff objects if exists, else false
     * @throws {AppError} if any error occurs
     */
    static async getInsuranceStaffForSuperAdmin() {
        try {
            const query = {
                text: `SELECT * FROM insurance_staff_view
                WHERE
                insurance_staff_role = '${VALID_ROLES_OBJECT.INSURANCE_ADMIN}'`
            };
            const result = await DatabaseService.query(query.text);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in InsuranceStaffService.getInsuranceStaffForSuperAdmin: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * inserts a new insurance staff
     * @param {Object} params object containing user_id of the requester and insurance staff details
     * @param {number} params.user_id id of the requester
     * @param {string} params.email email of the insurance staff
     * @param {string} params.password password of the insurance staff
     * @param {number} params.insurance_company_id id of the insurance company
     * @param {string} params.role role of the insurance staff
     * @returns {Promise<Object>} returns the inserted insurance staff object
     * @throws {AppError} if any error occurs
     */
    static async insertInsuranceStaff({ user_id, email, password, insurance_company_id, role }) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!email) {
                throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
            }

            email = validateEmail(email);

            if (!password) {
                throw new AppError("password is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            role = role.trim().toLowerCase();

            if (!VALID_INSURANCE_STAFF_ROLES.includes(role.toLowerCase())) {
                throw new AppError("Invalid role", STATUS_CODES.BAD_REQUEST);
            }

            const isSuperAdmin = await SuperAdminService.getSuperAdminIfExists(user_id);
            if (!isSuperAdmin) {
                const isInsuranceAdmin = await this.getInsuranceStaffIfExists(user_id);
                if (!isInsuranceAdmin) {
                    throw new AppError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
                }
                if (role === VALID_ROLES_OBJECT.INSURANCE_ADMIN) {
                    throw new AppError("Only super admins can create insurance admins", STATUS_CODES.UNAUTHORIZED);
                }
                insurance_company_id = isInsuranceAdmin.insurance_company_id;
            } else {
                if (role !== VALID_ROLES_OBJECT.INSURANCE_ADMIN) {
                    throw new AppError("super admins can only create insurance admins", STATUS_CODES.UNAUTHORIZED);
                }
            }
            if (!insurance_company_id) {
                throw new AppError("insurance_company_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const user = await UserService.insertUserIfNotExists(email, password);

            const query = {
                text: `INSERT INTO insurance_staff
                (insurance_staff_id, insurance_company_id, role)
                VALUES
                ($1, $2, $3)
                RETURNING *;`,
                values: [user.user_id, insurance_company_id, role]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert insurance staff", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in InsuranceStaffService.insertInsuranceStaff: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * deletes an insurance staff
     * @param {number} user_id id of the requester
     * @param {number} insurance_staff_id id of the insurance staff to be deleted
     * @returns {Promise<boolean>} returns true if deleted successfully
     * @throws {AppError} if any error occurs
     */
    static async deleteInsuranceStaff(user_id, insurance_staff_id) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!insurance_staff_id) {
                throw new AppError("insurance_staff_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (Number(user_id) === Number(insurance_staff_id)) {
                throw new AppError("You cannot delete your own account", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await this.getInsuranceStaffIfExists(insurance_staff_id);
            if (!staff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            const isSuperAdmin = await SuperAdminService.getSuperAdminIfExists(user_id);
            if (!isSuperAdmin) {
                const isInsuranceAdmin = await this.getInsuranceStaffIfExists(user_id);
                if (!isInsuranceAdmin) {
                    throw new AppError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
                }
                if (isInsuranceAdmin.insurance_company_id !== staff.insurance_company_id) {
                    throw new AppError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
                }
                if (staff.insurance_staff_role === VALID_ROLES_OBJECT.INSURANCE_ADMIN) {
                    throw new AppError("Cannot delete another insurance admin", STATUS_CODES.UNAUTHORIZED);
                }
            } else {
                if (staff.insurance_staff_role !== VALID_ROLES_OBJECT.INSURANCE_ADMIN) {
                    throw new AppError("Super admins can only delete insurance admins", STATUS_CODES.UNAUTHORIZED);
                }
            }

            const query = {
                text: `DELETE FROM insurance_staff
                WHERE
                insurance_staff_id = $1
                RETURNING *;`,
                values: [insurance_staff_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rows.length === 0) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            return true;
        } catch (error) {
            console.error(`Error in InsuranceStaffService.deleteInsuranceStaff: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { InsuranceStaffService };