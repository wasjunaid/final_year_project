const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");

class HospitalAssociationRequestFrontendService {
    /**
     * Gets all hospital association requests for a person with hospital name.
     * Used by frontend to display association requests for doctors/medical coders.
     * @param {number} person_id - The ID of the person.
     * @param {string} role - The role of the person.
     * @return {Promise<Array|boolean>} Array of requests with hospital_name if exists, false otherwise.
     * @throws {AppError} if any issue occurs
     */
    static async getHospitalAssociationRequestsForPersonIfExistsForFrontend(person_id, role) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT 
                    har.hospital_association_request_id,
                    har.hospital_id,
                    har.person_id,
                    h.name AS hospital_name,
                    har.created_at
                FROM hospital_association_request har
                LEFT JOIN hospital h ON h.hospital_id = har.hospital_id
                WHERE har.person_id = $1 AND har.role = $2
                ORDER BY har.created_at DESC`,
                values: [person_id, role]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestFrontendService.getHospitalAssociationRequestsForPersonIfExistsForFrontend: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Gets all hospital association requests for a hospital staff member with person details.
     * Used by frontend to display association requests for hospital admins.
     * @param {number} person_id - The ID of the hospital staff member.
     * @return {Promise<Array|boolean>} Array of requests with person details if exists, false otherwise.
     * @throws {AppError} if any issue occurs
     */
    static async getHospitalAssociationRequestsForHospitalStaffIfExistsForFrontend(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("No hospital staff found with the provided person_id", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `SELECT 
                    har.hospital_association_request_id,
                    har.hospital_id,
                    har.person_id,
                    CONCAT(p.first_name, ' ', p.last_name) AS person_name,
                    p.first_name AS person_first_name,
                    p.last_name AS person_last_name,
                    p.email AS person_email,
                    h.name AS hospital_name,
                    har.role,
                    har.created_at
                FROM hospital_association_request har
                LEFT JOIN person_view p ON p.person_id = har.person_id
                LEFT JOIN hospital h ON h.hospital_id = har.hospital_id
                WHERE har.hospital_id = $1
                ORDER BY har.created_at DESC`,
                values: [hospitalStaff.hospital_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestFrontendService.getHospitalAssociationRequestsForHospitalStaffIfExistsForFrontend: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { HospitalAssociationRequestFrontendService };
