const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");
const { SystemAdminService } = require("../System/SystemAdminService");
const { HospitalStaffService } = require("./HospitalStaffService"); 
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const {
    INSURANCE_BACKEND_BASE_URL,
    INSURANCE_BACKEND_INSERT_HOSPITAL_ENDPOINT,
    INSURANCE_BACKEND_UPDATE_HOSPITAL_ENDPOINT,
    INTERSYSTEM_SYNC_SECRET,
} = require("../../config/insuranceBackendConfig");
const axios = require("axios");

class HospitalService {
    /**
     * Fetches a hospital by ID from the database
     * @param {number} hospital_id - ID of the hospital to fetch
     * @returns {Promise<Object|boolean>} the hospital object or false if not found
     * @throws {AppError} if any issue occurs
     */
    static async getHospitalIfExists(hospital_id) {
        try {
            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM hospital
                WHERE
                hospital_id = $1`,
                values: [hospital_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in HospitalService.getHospital: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all hospitals from the database
     * @returns {Promise<Array>} list of all hospitals
     * @throws {AppError} if any issue occurs
     */
    static async getAllHospitalsIfExists() {
        try {
            const query = {
                text: `SELECT * FROM hospital`
            };
            const result = await DatabaseService.query(query.text);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in HospitalService.getAllHospitals: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new hospital into the database
     * @param {string} name - name of the hospital
     * @returns {Promise<Object>} the inserted hospital
     * @throws {AppError} if any issue occurs
     */
    static async insertHospital({
        name,
        focal_person_name = null,
        focal_person_email = null,
        focal_person_phone = null,
        address = null,
        hospitalization_daily_charge = 0,
    }) {
        try {
            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof name !== 'string') {
                throw new AppError("name must be a string", STATUS_CODES.BAD_REQUEST);
            }

            if (hospitalization_daily_charge === undefined || hospitalization_daily_charge === null || Number.isNaN(Number(hospitalization_daily_charge)) || Number(hospitalization_daily_charge) < 0) {
                throw new AppError("hospitalization_daily_charge must be a non-negative number", STATUS_CODES.BAD_REQUEST);
            }

            hospitalization_daily_charge = Number(hospitalization_daily_charge);

            const query = {
                text: `
                INSERT INTO hospital
                (name, focal_person_name, focal_person_email, focal_person_phone, address, hospitalization_daily_charge)
                VALUES
                ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                values: [name, focal_person_name, focal_person_email, focal_person_phone, address, hospitalization_daily_charge]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error inserting hospital", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            const insertedHospital = result.rows[0];
            try {
                await axios.post(
                    `${INSURANCE_BACKEND_BASE_URL}${INSURANCE_BACKEND_INSERT_HOSPITAL_ENDPOINT}`,
                    {
                        hospital_id: insertedHospital.hospital_id,
                        name: insertedHospital.name,
                        focal_person_name: insertedHospital.focal_person_name,
                        focal_person_email: insertedHospital.focal_person_email,
                        focal_person_phone: insertedHospital.focal_person_phone,
                        address: insertedHospital.address,
                        wallet_address: insertedHospital.wallet_address,
                    },
                    {
                        headers: {
                            "x-sync-secret": INTERSYSTEM_SYNC_SECRET,
                        },
                    }
                );
            } catch (syncError) {
                console.error(`Hospital insurance sync failed after creation for hospital ${insertedHospital.hospital_id}: ${syncError.message}`);
                return {
                    ...insertedHospital,
                    sync_warning: "Hospital created successfully, but external insurance sync failed.",
                };
            }

            return insertedHospital;
        } catch (error) {
            console.error(`Error in HospitalService.insertHospital: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Hospital with this name already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * Updates an existing hospital in the database
     * @param {Object} params - parameters for updating hospital
     * @param {number} params.person_id - ID of the person making the update
     * @param {number} params.hospital_id - ID of the hospital to update
     * @param {string} params.name - new name of the hospital
     * @returns {Promise<Object>} the updated hospital
     * @throws {AppError} if any issue occurs
     */
    static async updateHospital({
        person_id,
        hospital_id,
        name,
        wallet_address,
        focal_person_name = null,
        focal_person_email = null,
        focal_person_phone = null,
        address = null,
        hospitalization_daily_charge,
    }) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof name !== 'string') {
                throw new AppError("name must be a string", STATUS_CODES.BAD_REQUEST);
            }

            name = name.trim();

            if (name.length === 0) {
                throw new AppError("name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!wallet_address) {
                throw new AppError("wallet_address is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof wallet_address !== 'string') {
                throw new AppError("wallet_address must be a string", STATUS_CODES.BAD_REQUEST);
            }

            wallet_address = wallet_address.trim();

            if (wallet_address.length === 0) {
                throw new AppError("wallet_address cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (hospitalization_daily_charge !== undefined && hospitalization_daily_charge !== null) {
                if (Number.isNaN(Number(hospitalization_daily_charge)) || Number(hospitalization_daily_charge) < 0) {
                    throw new AppError("hospitalization_daily_charge must be a non-negative number", STATUS_CODES.BAD_REQUEST);
                }
                hospitalization_daily_charge = Number(hospitalization_daily_charge);
            }

            const superAdmin = await SystemAdminService.getSystemAdminAgainstRoleIfExists(person_id, VALID_ROLES_OBJECT.SUPER_ADMIN);
            if (!superAdmin) {
                const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
                if (!hospitalStaff) {
                    throw new AppError("Only super admin and hospital admin can update hospital", STATUS_CODES.FORBIDDEN);
                }

                if (hospitalStaff.hospital_id !== hospital_id) {
                    throw new AppError("Only hospital admin belonging to this hospital can update hospital", STATUS_CODES.FORBIDDEN);
                }
            }

            const query = {
                text: `
                UPDATE hospital
                SET
                name = $1,
                wallet_address = $2,
                focal_person_name = $3,
                focal_person_email = $4,
                focal_person_phone = $5,
                address = $6,
                hospitalization_daily_charge = COALESCE($8, hospitalization_daily_charge)
                WHERE
                hospital_id = $7
                RETURNING *`,
                values: [name, wallet_address, focal_person_name, focal_person_email, focal_person_phone, address, hospital_id, hospitalization_daily_charge]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error updating hospital", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            const updatedHospital = result.rows[0];
            try {
                await axios.put(
                    `${INSURANCE_BACKEND_BASE_URL}${INSURANCE_BACKEND_UPDATE_HOSPITAL_ENDPOINT}/${hospital_id}`,
                    {
                        name: updatedHospital.name,
                        focal_person_name: updatedHospital.focal_person_name,
                        focal_person_email: updatedHospital.focal_person_email,
                        focal_person_phone: updatedHospital.focal_person_phone,
                        address: updatedHospital.address,
                        wallet_address: updatedHospital.wallet_address,
                    },
                    {
                        headers: {
                            "x-sync-secret": INTERSYSTEM_SYNC_SECRET,
                        },
                    }
                );
            } catch (syncError) {
                console.error(`Hospital insurance sync failed after update for hospital ${updatedHospital.hospital_id}: ${syncError.message}`);
                return {
                    ...updatedHospital,
                    sync_warning: "Hospital updated successfully, but external insurance sync failed.",
                };
            }

            return updatedHospital;
        } catch (error) {
            console.error(`Error in HospitalService.updateHospital: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Hospital with this name already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }
}

module.exports = { HospitalService };