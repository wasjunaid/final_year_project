const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { VALID_INSURANCE_RELATION_TO_HOLDER } = require("../../utils/validConstantsUtil");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");
const { InsuranceCompanyService } = require("../Insurance/InsuranceCompanyService");
const { PersonService } = require("../Person/PersonService");
const { NotificationService } = require("../Notification/NotificationService");
const { LogService } = require("../Log/LogService");
const { VALID_TABLES_OBJECT } = require("../../utils/validConstantsUtil");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const axios = require('axios');
const { INSURANCE_BACKEND_BASE_URL, INSURANCE_BACKEND_VERIFY_INSURANCE_ENDPOINT } = require("../../config/insuranceBackendConfig");

class PatientInsuranceService {
    static addOneYear(dateObj) {
        const d = new Date(dateObj);
        d.setFullYear(d.getFullYear() + 1);
        return d;
    }

    static async getPatientPrimaryInsuranceIfExists(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM patient_insurance_view
                WHERE patient_id = $1 AND is_primary = true`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientInsuranceService.getPatientPrimaryInsuranceIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Retrieves a specific patient insurance if it exists.
     * @param {number} patient_id - The ID of the patient.
     * @param {number} patient_insurance_id - The ID of the patient insurance.
     * @returns {Promise<object|boolean>} The patient insurance object if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getPatientInsuranceIfExists(patient_id, patient_insurance_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM patient_insurance_view
                WHERE
                patient_id = $1 AND patient_insurance_id = $2`,
                values: [patient_id, patient_insurance_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientInsuranceService.getPatientInsuranceIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Retrieves all insurances for a specific patient if any exist.
     * @param {number} patient_id - The ID of the patient.
     * @returns {Promise<object[]|boolean>} An array of patient insurance objects if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAllPatientInsurancesIfExists(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM patient_insurance_view
                WHERE
                patient_id = $1`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in PatientInsuranceService.getAllPatientInsurancesIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new patient insurance into the database.
     * @param {object} params - The parameters for the new patient insurance.
     * @param {number} params.patient_id - The ID of the patient.
     * @param {number} params.insurance_company_id - The ID of the insurance company.
     * @param {string} params.insurance_number - The insurance number.
     * @param {string} params.policy_holder_name - The name of the policy holder.
     * @param {string} params.relationship_to_holder - The relationship to the policy holder.
     * @param {boolean} [params.is_primary=false] - Whether this insurance is primary.
     * @returns {Promise<object>} The inserted patient insurance object.
     * @throws {AppError} if any issue occurs
     */
    static async insertPatientInsurance({ patient_id, insurance_company_id, insurance_number, policy_holder_name, relationship_to_holder, is_primary = false }) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_company_id) {
                throw new AppError("insurance_company_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const insuranceCompany = await InsuranceCompanyService.getInsuranceCompanyIfExists(insurance_company_id);
            if (!insuranceCompany) {
                throw new AppError("Insurance company does not exist", STATUS_CODES.NOT_FOUND);
            }

            if (!insurance_number) {
                throw new AppError("insurance_number is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!policy_holder_name) {
                throw new AppError("policy_holder_name is required", STATUS_CODES.BAD_REQUEST);
            }

            policy_holder_name = policy_holder_name.trim();
            if (policy_holder_name.length === 0) {
                throw new AppError("policy_holder_name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!relationship_to_holder) {
                throw new AppError("relationship_to_holder is required", STATUS_CODES.BAD_REQUEST);
            }

            relationship_to_holder = relationship_to_holder.trim().toLowerCase();
            if (relationship_to_holder.length === 0) {
                throw new AppError("relationship_to_holder cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!VALID_INSURANCE_RELATION_TO_HOLDER.includes(relationship_to_holder)) {
                throw new AppError(`relationship_to_holder must be one of: ${VALID_INSURANCE_RELATION_TO_HOLDER.join(", ")}`, STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO patient_insurance
                (patient_id, insurance_company_id, insurance_number, policy_holder_name, relationship_to_holder, is_primary)
                VALUES
                ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                values: [patient_id, insurance_company_id, insurance_number, policy_holder_name, relationship_to_holder, is_primary]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error inserting patient insurance", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            // auto send verification request here (if needed in future)

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientInsuranceService.insertPatientInsurance: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Patient insurance already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * Updates an existing patient insurance in the database.
     * @param {object} params - The parameters for updating the patient insurance.
     * @param {number} params.patient_id - The ID of the patient.
     * @param {number} params.patient_insurance_id - The ID of the patient insurance.
     * @param {boolean} params.is_primary - Whether this insurance is primary.
     * @return {Promise<object>} The updated patient insurance object.
     * @throws {AppError} if any issue occurs
     */
    static async updatePatientInsurance({ patient_id, patient_insurance_id, is_primary }) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof is_primary !== 'boolean') {
                throw new AppError("is_primary must be a boolean", STATUS_CODES.BAD_REQUEST);
            }

            if (is_primary) {
                await PatientInsuranceService.changeRestOfPatientInsurancesToSecondary(patient_id, patient_insurance_id);
            }

            const query = {
                text: `UPDATE patient_insurance
                SET
                is_primary = $1
                WHERE
                patient_id = $2 AND patient_insurance_id = $3
                RETURNING *`,
                values: [is_primary, patient_id, patient_insurance_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error updating patient insurance", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientInsuranceService.updatePatientInsurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Deletes a patient insurance from the database.
     * @param {number} patient_id - The ID of the patient.
     * @param {number} patient_insurance_id - The ID of the patient insurance.
     * @returns {Promise<boolean>} true if deleted
     * @throws {AppError} if any issue occurs
     */
    static async deletePatientInsurance(patient_id, patient_insurance_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `DELETE FROM patient_insurance
                WHERE
                patient_id = $1 AND patient_insurance_id = $2`,
                values: [patient_id, patient_insurance_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error deleting patient insurance", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in PatientInsuranceService.deletePatientInsurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Changes all other insurances of the patient to non-primary.
     * @param {number} patient_id - The ID of the patient.
     * @param {number} patient_insurance_id - The ID of the patient insurance to remain primary.
     * @returns {Promise<boolean>} true if updated
     * @throws {AppError} if any issue occurs
     */
    static async changeRestOfPatientInsurancesToSecondary(patient_id, patient_insurance_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `UPDATE patient_insurance
                SET
                is_primary = FALSE
                WHERE
                patient_id = $1 AND patient_insurance_id != $2`,
                values: [patient_id, patient_insurance_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error updating patient insurances", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in PatientInsuranceService.changeRestOfInsurancesToNonPrimary: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Sends a verification request for a patient's insurance.
     * @param {number} patient_id - The ID of the patient.
     * @param {number} patient_insurance_id - The ID of the patient insurance.
     * @returns {Promise<void>}
     * @throws {AppError} if any issue occurs
     */
    static async sendPatientInsuranceVerificationRequest(patient_id, patient_insurance_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const person = await PersonService.getPersonIfExists(patient_id);
            if (!person) {
                throw new AppError("Patient does not exist", STATUS_CODES.NOT_FOUND);
            }

            const patientInsurance = await PatientInsuranceService.getPatientInsuranceIfExists(patient_id, patient_insurance_id);
            if (!patientInsurance) {
                throw new AppError("Patient insurance does not exist", STATUS_CODES.NOT_FOUND);
            }
            if (patientInsurance.is_verified) {
                throw new AppError("Patient insurance is already verified", STATUS_CODES.BAD_REQUEST);
            }

            const response = await axios.post(`${INSURANCE_BACKEND_BASE_URL}${INSURANCE_BACKEND_VERIFY_INSURANCE_ENDPOINT}`, {
                cnic: person.cnic,
                first_name: person.first_name,
                last_name: person.last_name,
                insurance_number: patientInsurance.insurance_number,
                policy_holder_name: patientInsurance.policy_holder_name,
                relationship_to_holder: patientInsurance.relationship_to_holder
            });
            if (!response.data.success) {
                throw new AppError("Insurance verification failed", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return await this.verifyPatientInsurance(patient_id, patient_insurance_id);
        } catch (error) {
            console.error(`Error in PatientInsuranceService.sendPatientInsuranceVerificationRequest: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Verifies a patient's insurance.
     * @param {number} patient_id - The ID of the patient.
     * @param {number} patient_insurance_id - The ID of the patient insurance.
     * @returns {Promise<object>} The verified patient insurance object.
     * @throws {AppError} if any issue occurs
     */
    static async verifyPatientInsurance(patient_id, patient_insurance_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `UPDATE patient_insurance
                SET
                is_verified = $1,
                is_active = TRUE,
                effective_date = COALESCE(effective_date, CURRENT_DATE),
                expiration_date = COALESCE(expiration_date, CURRENT_DATE + INTERVAL '1 year')
                WHERE
                patient_id = $2 AND patient_insurance_id = $3
                RETURNING *`,
                values: [true, patient_id, patient_insurance_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error verifying patient insurance", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientInsuranceService.verifyPatientInsurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async toggleAutoRenewal(patient_id, patient_insurance_id, auto_renewal_enabled) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof auto_renewal_enabled !== "boolean") {
                throw new AppError("auto_renewal_enabled must be a boolean", STATUS_CODES.BAD_REQUEST);
            }

            const insurance = await this.getPatientInsuranceIfExists(patient_id, patient_insurance_id);
            if (!insurance) {
                throw new AppError("Patient insurance does not exist", STATUS_CODES.NOT_FOUND);
            }

            if (auto_renewal_enabled && !insurance.is_verified) {
                throw new AppError("Only verified insurance can enable auto-renewal", STATUS_CODES.BAD_REQUEST);
            }

            if (auto_renewal_enabled && !insurance.is_active) {
                throw new AppError("Cannot enable auto-renewal on inactive insurance", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `UPDATE patient_insurance
                SET
                auto_renewal_enabled = $1
                WHERE patient_id = $2 AND patient_insurance_id = $3
                RETURNING *`,
                values: [auto_renewal_enabled, patient_id, patient_insurance_id],
            };

            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to update auto renewal preference", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientInsuranceService.toggleAutoRenewal: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deactivatePatientInsurance(patient_id, patient_insurance_id, deactivation_reason = "deactivated by patient") {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const insurance = await this.getPatientInsuranceIfExists(patient_id, patient_insurance_id);
            if (!insurance) {
                throw new AppError("Patient insurance does not exist", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `UPDATE patient_insurance
                SET
                is_active = FALSE,
                auto_renewal_enabled = FALSE,
                deactivated_at = CURRENT_TIMESTAMP,
                deactivation_reason = $1
                WHERE patient_id = $2 AND patient_insurance_id = $3
                RETURNING *`,
                values: [deactivation_reason, patient_id, patient_insurance_id],
            };

            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to deactivate insurance", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            try {
                await LogService.insertLog(patient_id, `Patient insurance ${patient_insurance_id} deactivated`);
            } catch (logError) {
                console.error(`deactivatePatientInsurance log failed: ${logError.message}`);
            }

            try {
                await NotificationService.insertNotification({
                    person_id: patient_id,
                    role: VALID_ROLES_OBJECT.PATIENT,
                    title: "Insurance Deactivated",
                    message: "Your insurance has been deactivated and auto-renewal has been turned off.",
                    type: "alert",
                    related_id: patient_insurance_id,
                    related_table: VALID_TABLES_OBJECT.PATIENT_INSURANCE,
                    sendEmail: false,
                });
            } catch (notificationError) {
                console.error(`deactivatePatientInsurance notification failed: ${notificationError.message}`);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientInsuranceService.deactivatePatientInsurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async renewPatientInsuranceIfEligible({ patient_id, patient_insurance_id, target_date }) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_insurance_id) {
                throw new AppError("patient_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const insurance = await this.getPatientInsuranceIfExists(patient_id, patient_insurance_id);
            if (!insurance) {
                return false;
            }

            if (!insurance.is_active || !insurance.is_verified || !insurance.auto_renewal_enabled) {
                return false;
            }

            if (!insurance.expiration_date) {
                return false;
            }

            const targetDate = target_date ? new Date(target_date) : new Date();
            if (Number.isNaN(targetDate.getTime())) {
                return false;
            }

            const currentExpiry = new Date(insurance.expiration_date);
            if (Number.isNaN(currentExpiry.getTime())) {
                return false;
            }

            if (currentExpiry >= targetDate) {
                return false;
            }

            let nextExpiry = new Date(currentExpiry);
            let guard = 0;
            while (nextExpiry < targetDate && guard < 20) {
                nextExpiry = this.addOneYear(nextExpiry);
                guard += 1;
            }

            const query = {
                text: `UPDATE patient_insurance
                SET
                expiration_date = $1,
                last_renewed_at = CURRENT_TIMESTAMP
                WHERE patient_id = $2 AND patient_insurance_id = $3
                RETURNING *`,
                values: [nextExpiry.toISOString().slice(0, 10), patient_id, patient_insurance_id],
            };

            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to auto-renew patient insurance", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            try {
                await LogService.insertLog(patient_id, `Patient insurance ${patient_insurance_id} auto-renewed until ${nextExpiry.toISOString().slice(0, 10)}`);
            } catch (logError) {
                console.error(`renewPatientInsuranceIfEligible log failed: ${logError.message}`);
            }

            try {
                await NotificationService.insertNotification({
                    person_id: patient_id,
                    role: VALID_ROLES_OBJECT.PATIENT,
                    title: "Insurance Auto-Renewed",
                    message: `Your policy was auto-renewed and is now valid until ${nextExpiry.toISOString().slice(0, 10)}.`,
                    type: "system",
                    related_id: patient_insurance_id,
                    related_table: VALID_TABLES_OBJECT.PATIENT_INSURANCE,
                    sendEmail: false,
                });
            } catch (notificationError) {
                console.error(`renewPatientInsuranceIfEligible notification failed: ${notificationError.message}`);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PatientInsuranceService.renewPatientInsuranceIfEligible: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async ensurePrimaryInsuranceActiveForDate(patient_id, target_date) {
        try {
            const primaryInsurance = await this.getPatientPrimaryInsuranceIfExists(patient_id);
            if (!primaryInsurance) {
                return false;
            }

            const renewed = await this.renewPatientInsuranceIfEligible({
                patient_id,
                patient_insurance_id: primaryInsurance.patient_insurance_id,
                target_date,
            });

            if (renewed) {
                return renewed;
            }

            return primaryInsurance;
        } catch (error) {
            console.error(`Error in PatientInsuranceService.ensurePrimaryInsuranceActiveForDate: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PatientInsuranceService };