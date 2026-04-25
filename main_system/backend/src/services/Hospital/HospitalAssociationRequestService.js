const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const { VALID_HOSPITAL_ASSOCIATION_REQUEST_ROLES } = require("../../utils/validConstantsUtil");
const { PersonService } = require("../Person/PersonService");
const { DoctorService } = require("../Doctor/DoctorService");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");
const { NotificationService } = require("../Notification/NotificationService");
const { LogService } = require("../Log/LogService");
const { VALID_TABLES_OBJECT } = require("../../utils/validConstantsUtil");

class HospitalAssociationRequestService {
    /**
     * Checks if a hospital association request exists by ID.
     * @param {number} hospital_association_request_id - The ID of the hospital association request.
     * @return {Promise<object|boolean>} The request object if exists, false otherwise.
     * @throws {AppError} if any issue occurs
     */
    static async getHospitalAssociationRequestIfExists(hospital_association_request_id) {
        try {
            if (!hospital_association_request_id) {
                throw new AppError("hospital_association_request_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM hospital_association_request
                WHERE hospital_association_request_id = $1`,
                values: [hospital_association_request_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestService.getHospitalAssociationRequestIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Checks if a hospital association request exists by ID.
     * @param {number} hospital_association_request_id - The ID of the hospital association request.
     * @return {Promise<object|boolean>} The request object if exists, false otherwise.
     * @throws {AppError} if any issue occurs
     */
    static async getHospitalAssociationRequestIfExistsForFrontend(hospital_association_request_id) {
        try {
            if (!hospital_association_request_id) {
                throw new AppError("hospital_association_request_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT har.*, p.first_name AS person_first_name, p.last_name AS person_last_name, p.email AS person_email, h.name AS hospital_name
                FROM hospital_association_request har
                LEFT JOIN person_view p ON p.person_id = har.person_id
                LEFT JOIN hospital h ON h.hospital_id = har.hospital_id
                WHERE har.hospital_association_request_id = $1`,
                values: [hospital_association_request_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestService.getHospitalAssociationRequestIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Checks if a hospital association request exists for a person by ID and role.
     * @param {number} person_id - The ID of the person.
     * @param {string} role - The role of the person.
     * @return {Promise<Array|boolean>} Array of requests if exists, false otherwise.
     * @throws {AppError} if any issue occurs
     */
    static async getHospitalAssociationRequestsForPersonIfExists(person_id, role) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM hospital_association_request
                WHERE person_id = $1 AND role = $2`,
                values: [person_id, role]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestService.getHospitalAssociationRequestsForPersonIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Checks if a hospital association request exists for a person by ID and role.
     * @param {number} person_id - The ID of the person.
     * @param {string} role - The role of the person.
     * @return {Promise<Array|boolean>} Array of requests if exists, false otherwise.
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
                text: `SELECT har.*, h.name AS hospital_name
                FROM hospital_association_request har
                LEFT JOIN hospital h ON h.hospital_id = har.hospital_id
                WHERE har.person_id = $1 AND har.role = $2`,
                values: [person_id, role]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestService.getHospitalAssociationRequestsForPersonIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Gets all hospital association requests for a hospital staff member if they exist.
     * @param {number} person_id - The ID of the hospital staff member.
     * @return {Promise<Array|boolean>} Array of requests if exists, false otherwise.
     * @throws {AppError} if any issue occurs
     */
    static async getHospitalAssociationRequestsForHospitalStaffIfExists(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("No hospital staff found with the provided person_id", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `SELECT * FROM hospital_association_request
                WHERE
                hospital_id = $1`,
                values: [hospitalStaff.hospital_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestService.getHospitalAssociationRequestsForHospitalStaffIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Gets all hospital association requests for a hospital staff member if they exist.
     * @param {number} person_id - The ID of the hospital staff member.
     * @return {Promise<Array|boolean>} Array of requests if exists, false otherwise.
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
                text: `SELECT har.*, p.first_name AS person_first_name, p.last_name AS person_last_name, p.email AS person_email, h.name AS hospital_name
                FROM hospital_association_request har
                LEFT JOIN person_view p ON p.person_id = har.person_id
                LEFT JOIN hospital h ON h.hospital_id = har.hospital_id
                WHERE
                har.hospital_id = $1`,
                values: [hospitalStaff.hospital_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestService.getHospitalAssociationRequestsForHospitalStaffIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new hospital association request into the database.
     * @param {object} params - The hospital association request details.
     * @param {number} params.person_id - The ID of the hospital staff member creating the request.
     * @param {string} params.email - The email of the person to associate.
     * @param {string} params.role - The role of the person to associate (doctor or medical coder).
     * @return {Promise<object>} The inserted hospital association request object.
     * @throws {AppError} if any issue occurs
     */
    static async insertHospitalAssociationRequest({person_id, email, role}) {
        if (!person_id) {
            throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
        }

        if (!email) {
            throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
        }

        if (!role) {
            throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
        }

        if (!VALID_HOSPITAL_ASSOCIATION_REQUEST_ROLES.includes(role)) {
            throw new AppError(`Invalid role`, STATUS_CODES.BAD_REQUEST);
        }

        const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);

        if (!hospitalStaff) {
            throw new AppError("No hospital staff found with the provided person_id", STATUS_CODES.NOT_FOUND);
        }

        try {
            const person = await PersonService.getPersonByEmailIfExists(email);
            if (!person) {
                throw new AppError("No person found with the provided email", STATUS_CODES.NOT_FOUND);
            }

            if (role === VALID_ROLES_OBJECT.DOCTOR) {
                const doctor = await DoctorService.getDoctorIfExists(person.person_id);
                if (!doctor) {
                    throw new AppError("No doctor found with the provided email", STATUS_CODES.NOT_FOUND);
                }

                if (doctor.hospital_id) {
                    throw new AppError("Doctor is already associated with a hospital", STATUS_CODES.CONFLICT);
                }
            } else {
                throw new AppError("Role not supported for hospital association request", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO hospital_association_request
                (hospital_id, person_id, role)
                VALUES
                ($1, $2, $3)
                RETURNING *`,
                values: [hospitalStaff.hospital_id, person.person_id, role]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error inserting hospital association request", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            try {
                await NotificationService.insertNotification({
                    person_id: person.person_id,
                    role,
                    title: "Hospital Association Request",
                    message: `You have a new request to join hospital ID ${hospitalStaff.hospital_id} as ${role}.`,
                    type: "system",
                    related_id: result.rows[0].hospital_association_request_id,
                    related_table: VALID_TABLES_OBJECT.HOSPITAL_ASSOCIATION_REQUEST,
                    sendEmail: false,
                });
            } catch (notificationError) {
                console.error(`Hospital association notification failed: ${notificationError.message}`);
            }

            try {
                await LogService.insertLog(
                    person_id,
                    `Hospital association request ${result.rows[0].hospital_association_request_id} created for person ${person.person_id} with role ${role}`
                );
            } catch (logError) {
                console.error(`Hospital association log failed: ${logError.message}`);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestService.insertHospitalAssociationRequest: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Hospital association request already exists for this person and role", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * Deletes a hospital association request for a hospital staff member by ID.
     * Only the hospital staff member who created the request can delete it.
     * @param {number} person_id - The ID of the hospital staff member.
     * @param {number} hospital_association_request_id - The ID of the hospital association request to delete.
     * @return {Promise<object>} The deleted hospital association request object.
     * @throws {AppError} if any issue occurs
     */
    static async deleteHospitalAssociationRequestForHospitalStaff(person_id, hospital_association_request_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!hospital_association_request_id) {
                throw new AppError("hospital_association_request_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("No hospital staff found with the provided person_id", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `DELETE FROM hospital_association_request
                WHERE
                hospital_association_request_id = $1 AND hospital_id = $2
                RETURNING *`,
                values: [hospital_association_request_id, hospitalStaff.hospital_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error deleting hospital association request", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestService.deleteHospitalAssociationRequestForHospitalStaff: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Deletes a hospital association request by ID.
     * Only the person who created the request can delete it.
     * @param {number} person_id - The ID of the person.
     * @param {number} hospital_association_request_id - The ID of the hospital association request to delete.
     * @return {Promise<object>} The deleted hospital association request object.
     * @throws {AppError} if any issue occurs
     */
    static async deleteHospitalAssociationRequestForPerson(person_id, hospital_association_request_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!hospital_association_request_id) {
                throw new AppError("hospital_association_request_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `DELETE FROM hospital_association_request
                WHERE
                person_id = $1 AND
                hospital_association_request_id = $2
                RETURNING *`,
                values: [person_id, hospital_association_request_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error deleting hospital association request", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestService.deleteHospitalAssociationRequestForPerson: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Deletes all hospital association requests for a person by ID and role.
     * @param {number} person_id - The ID of the person.
     * @param {string} role - The role of the person.
     * @return {Promise<boolean>} true if deleted successfully.
     * @throws {AppError} if any issue occurs
     */
    static async deleteAllHospitalAssociationRequestsForPerson(person_id, role) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `DELETE FROM hospital_association_request
                WHERE
                person_id = $1 AND role = $2
                RETURNING *`,
                values: [person_id, role]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error deleting hospital association requests", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestService.deleteAllHospitalAssociationRequestsForPerson: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Accepts a hospital association request by ID.
     * Updates the person's hospital association based on their role.
     * @param {number} person_id - The ID of the person accepting the request.
     * @param {number} hospital_association_request_id - The ID of the hospital association request to accept.
     * @return {Promise<object>} The accepted hospital association request object.
     * @throws {AppError} if any issue occurs
     */
    static async acceptHospitalAssociationRequest(person_id, hospital_association_request_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }
            
            if (!hospital_association_request_id) {
                throw new AppError("hospital_association_request_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const request = await this.getHospitalAssociationRequestIfExists(hospital_association_request_id);
            if (!request) {
                throw new AppError("No hospital association request found with the provided id", STATUS_CODES.NOT_FOUND);
            }

            if (request.person_id !== person_id) {
                throw new AppError("You can only accept your own hospital association requests", STATUS_CODES.FORBIDDEN);
            }

            if (request.role === VALID_ROLES_OBJECT.DOCTOR) {
                await DoctorService.updateDoctorHospitalAssociationForDoctor(request.person_id, request.hospital_id);
            }
            else {
                throw new AppError("Role not supported for hospital association acceptance", STATUS_CODES.BAD_REQUEST);
            }

            await this.deleteAllHospitalAssociationRequestsForPerson(person_id, request.role);

            try {
                await NotificationService.insertNotification({
                    person_id,
                    role: request.role,
                    title: "Hospital Association Accepted",
                    message: `You have successfully joined hospital ID ${request.hospital_id} as ${request.role}.`,
                    type: "system",
                    related_id: hospital_association_request_id,
                    related_table: VALID_TABLES_OBJECT.HOSPITAL_ASSOCIATION_REQUEST,
                    sendEmail: false,
                });
            } catch (notificationError) {
                console.error(`Hospital association acceptance notification failed: ${notificationError.message}`);
            }

            try {
                await LogService.insertLog(
                    person_id,
                    `Hospital association request ${hospital_association_request_id} accepted for hospital ${request.hospital_id}`
                );
            } catch (logError) {
                console.error(`Hospital association acceptance log failed: ${logError.message}`);
            }

            return request;
        } catch (error) {
            console.error(`Error in HospitalAssociationRequestService.acceptHospitalAssociationRequest: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { HospitalAssociationRequestService };