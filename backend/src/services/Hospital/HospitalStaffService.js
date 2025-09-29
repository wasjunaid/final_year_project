const { pool } = require("../../config/databaseConfig");
const { PersonService } = require("../Person/PersonService");
const { SystemAdminService } = require("../System/systemAdminService");
const { validHospitalStaffRoles } = require("../../database/hospital/hospitalStaffTableQuery");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class HospitalStaffService {
    static async getHospitalStaff(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT hs.*,
                h.name AS hospital_name,
                ad.address AS hospital_address
                FROM hospital_staff hs
                JOIN hospital h ON hs.hospital_id = h.hospital_id
                JOIN address ad ON ad.address_id = h.address_id
                WHERE
                hs.hospital_staff_id = $1`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Hospital staff not found", statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error getting hospital staff: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getAllHospitalStaff(person_id, hospital_id){
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!hospital_id) {
            throw new AppError("hospital_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const hospitalStaff = await this.checkHospitalStaffExistsAgainstHospitalID(person_id, hospital_id);
            if (!hospitalStaff) {
                throw new AppError("Only hospital staff can view all hospital staff", statusCodes.FORBIDDEN);
            }
            if (hospitalStaff.role !== 'hospital admin' && hospitalStaff.role !== 'hospital sub admin') {
                throw new AppError("Only hospital admin and hospital sub admin can view all hospital staff", statusCodes.FORBIDDEN);
            }

            const query = {
                text: `SELECT * FROM hospital_staff
                WHERE
                hospital_id = $1`,
                values: [hospital_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Hospital staff not found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting hospital staff: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertHospitalStaff(person_id, {
        email,
        hospital_id,
        role
    }) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!email) {
            throw new AppError("email is required", statusCodes.BAD_REQUEST);
        }
        if (!hospital_id) {
            throw new AppError("hospital_id is required", statusCodes.BAD_REQUEST);
        }
        if (!role) {
            throw new AppError("role is required", statusCodes.BAD_REQUEST);
        }
        if (!validHospitalStaffRoles.includes(role)) {
            throw new AppError(`invalid role`, statusCodes.BAD_REQUEST);
        }

        try {
            let hospitalStaff;
            const checkSystemAdminExists = await SystemAdminService.checkSystemAdminExistsAgainstRole(person_id, 'super admin');
            if (!checkSystemAdminExists) {
                hospitalStaff = await this.checkHospitalStaffExistsAgainstHospitalID(person_id, hospital_id);
                if (!hospitalStaff) {
                    throw new AppError("Only hospital staff can add new hospital staff", statusCodes.FORBIDDEN);
                }
                if (hospitalStaff.role !== 'hospital admin' && hospitalStaff.role !== 'hospital sub admin') {
                    throw new AppError("Only hospital admin and hospital sub admin can add hospital staff", statusCodes.FORBIDDEN);
                }
                if (hospitalStaff.role !== 'hospital admin' && role === 'hospital admin') {
                    throw new AppError("Only hospital admin can add another hospital admin", statusCodes.FORBIDDEN);
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
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error inserting hospital staff", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting hospital staff: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deleteHospitalStaff(person_id, hospital_staff_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!hospital_staff_id) {
            throw new AppError("hospital_staff_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const hospitalStaff = await this.checkHospitalStaffExists(person_id);

            const deleteStaffCheck = await this.checkHospitalStaffExists(hospital_staff_id);

            if (!hospitalStaff) {
                throw new AppError("Only hospital staff can delete hospital staff", statusCodes.FORBIDDEN);
            }
            if (hospitalStaff.hospital_id !== deleteStaffCheck.hospital_id) {
                throw new AppError("Cannot delete hospital staff from another hospital", statusCodes.FORBIDDEN);
            }
            if (hospitalStaff.role !== 'hospital admin' && hospitalStaff.role !== 'hospital sub admin') {
                throw new AppError("Only hospital admin and hospital sub admin can delete hospital staff", statusCodes.FORBIDDEN);
            }
            if (hospitalStaff.role !== 'hospital admin' && deleteStaffCheck.role === 'hospital admin') {
                throw new AppError("Only hospital admin can delete another hospital admin", statusCodes.FORBIDDEN);
            }

            const query = {
                text: `DELETE FROM hospital_staff
                WHERE
                hospital_staff_id = $1
                RETURNING *`,
                values: [hospital_staff_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error deleting hospital staff", statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            console.error(`Error deleting hospital staff: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkHospitalStaffExistsAgainstHospitalID(person_id, hospital_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!hospital_id) {
            throw new AppError("hospital_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM hospital_staff
                WHERE
                hospital_staff_id = $1
                AND
                hospital_id = $2`,
                values: [person_id, hospital_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error checking hospital staff exists against hospital id: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkHospitalStaffExists(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM hospital_staff
                WHERE
                hospital_staff_id = $1`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error checking hospital staff exists: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { HospitalStaffService };