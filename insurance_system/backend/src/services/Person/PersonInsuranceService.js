const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { InsuranceStaffService } = require("../Insurance/InsuranceStaffService");
const { PersonService } = require("./PersonService");
const { InsurancePlanService } = require("../Insurance/InsurancePlanService");
const { InsuranceService } = require("../Insurance/InsuranceService");
const { VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER, CNIC_REGEX, CNIC_HYPHENATED_REGEX, INSURANCE_NUMBER_MIN_LENGTH, INSURANCE_NUMBER_MAX_LENGTH } = require("../../utils/validConstantsUtil");

class PersonInsuranceService {
    /**
     * get person insurances if exists using insurance number
     * @param {string} insurance_number - insurance number
     * @returns {Promise<Array|boolean>} array of person insurances or false if none exist
     * @throws {AppError} if insurance_number is not provided or if any other error occurs
     */
    static async getPersonInsurancesIfExistsUsingInsuranceNumber(insurance_number) {
        try {
            if (!insurance_number) {
                throw new AppError("insurance_number is required", STATUS_CODES.BAD_REQUEST);
            }

            insurance_number = insurance_number.trim();

            if (insurance_number.length < INSURANCE_NUMBER_MIN_LENGTH || insurance_number.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`insurance_number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters long`, STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM person_insurance_view
                WHERE
                insurance_number = $1`,
                values: [insurance_number],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in PersonInsuranceService.getPersonInsurancesIfExistsUsingInsuranceNumber: ${error.message} ${error.status}`);
            throw error;
        }   
    }

    /**
     * get person insurances if exists for insurance staff's insurance company
     * @param {number} user_id - user id of the insurance staff
     * @returns {Promise<Array|boolean>} array of person insurances or false if none exist
     * @throws {AppError} if user_id is not provided or if any other error occurs
     */
    static async getPersonInsurancesIfExists(user_id) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("Only insurance staff can view person insurances", STATUS_CODES.FORBIDDEN);
            }

            const query = {
                text: `SELECT * FROM person_insurance_view
                WHERE
                insurance_company_id = $1`,
                values: [staff.insurance_company_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in PersonInsuranceService.getPersonInsurancesIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * insert a new person insurance
     * @param {Object} params - parameters object
     * @param {number} params.user_id - user id of the insurance staff
     * @param {string} params.cnic - cnic of the person
     * @param {string} params.insurance_number - insurance number
     * @param {string} params.relationship_to_holder - relationship to the policy holder
     * @returns {Promise<Object>} inserted person insurance
     * @throws {AppError} if any parameter is missing or invalid, or if any other error occurs
     */
    static async insertPersonInsurance({ user_id, cnic, insurance_number, relationship_to_holder }) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!cnic) {
                throw new AppError("cnic is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!CNIC_REGEX.test(cnic) && !CNIC_HYPHENATED_REGEX.test(cnic)) {
                throw new AppError("cnic must be in valid format", STATUS_CODES.BAD_REQUEST);
            }

            cnic = cnic.replace(/-/g, ""); // Remove hyphens if any

            if (!insurance_number) {
                throw new AppError("insurance_number is required", STATUS_CODES.BAD_REQUEST);
            }

            insurance_number = insurance_number.trim();

            if (insurance_number.length < INSURANCE_NUMBER_MIN_LENGTH || insurance_number.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`insurance_number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters long`, STATUS_CODES.BAD_REQUEST);
            }

            if (!relationship_to_holder) {
                throw new AppError("relationship_to_holder is required", STATUS_CODES.BAD_REQUEST);
            }

            relationship_to_holder = relationship_to_holder.trim().toLowerCase();

            if (!VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER.includes(relationship_to_holder)) {
                throw new AppError(`relationship_to_holder must be one of the following: ${VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER.join(", ")}`, STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("Only insurance staff can add person insurances", STATUS_CODES.FORBIDDEN);
            }

            const person = await PersonService.getPersonIfExists(cnic);
            if (!person) {
                throw new AppError("Person does not exist with the given cnic", STATUS_CODES.BAD_REQUEST);
            }

            const insurance = await InsuranceService.getInsuranceIfExists(insurance_number);
            if (!insurance) {
                throw new AppError("Insurance does not exist for the given insurance number", STATUS_CODES.BAD_REQUEST);
            }

            const plan = await InsurancePlanService.getInsurancePlanIfExists(insurance.insurance_plan_id);
            if (!plan) {
                throw new AppError("Insurance plan does not exist for the given insurance number", STATUS_CODES.BAD_REQUEST);
            }

            if (plan.insurance_company_id !== staff.insurance_company_id) {
                throw new AppError("Cannot add person insurance for an insurance number that does not belong to your insurance company", STATUS_CODES.FORBIDDEN);
            }

            const existingInsurance = await PersonInsuranceService.getPersonInsurancesIfExistsUsingInsuranceNumber(insurance_number);
            if (existingInsurance.length >= plan.number_of_persons) {
                throw new AppError("Cannot add more person insurances for this insurance number as it has reached the maximum allowed persons", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO person_insurance
                (cnic, insurance_number, relationship_to_holder)
                VALUES
                ($1, $2, $3)
                RETURNING *`,
                values: [cnic, insurance_number, relationship_to_holder],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert person insurance", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PersonInsuranceService.insertPersonInsurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * delete a person insurance
     * @param {number} user_id - user id of the insurance staff
     * @param {number} person_insurance_id - id of the person insurance to delete
     * @returns {Promise<boolean>} true if deletion was successful
     * @throws {AppError} if any parameter is missing or if any other error occurs
     */
    static async deletePersonInsurance(user_id, person_insurance_id) {
        try {
            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!person_insurance_id) {
                throw new AppError("person_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!staff) {
                throw new AppError("Only insurance staff can delete person insurances", STATUS_CODES.FORBIDDEN);
            }

            const query = {
                text: `DELETE FROM person_insurance WHERE
                person_insurance_id = $1`,
                values: [person_insurance_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to delete person insurance", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (error) {
            console.error(`Error in PersonInsuranceService.deletePersonInsurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     *  verify person insurance details
     * @param {Object} params - person insurance details
     * @param {string} params.cnic - cnic of the person
     * @param {string} params.first_name - first name of the person
     * @param {string} params.last_name - last name of the person
     * @param {string} params.insurance_number - insurance number
     * @param {string} params.policy_holder_name - name of the policy holder
     * @param {string} params.relationship_to_holder - relationship to the policy holder
     * @returns {Promise<boolean>} true if verification is successful
     * @throws {AppError} if any parameter is missing or invalid
     */
    static async verifyPersonInsurance({cnic, first_name, last_name, insurance_number, policy_holder_name, relationship_to_holder}) {
        try {
            if (!cnic) {
                throw new AppError("cnic is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!CNIC_REGEX.test(cnic) && !CNIC_HYPHENATED_REGEX.test(cnic)) {
                throw new AppError("cnic must be in valid format", STATUS_CODES.BAD_REQUEST);
            }

            cnic = cnic.replace(/-/g, ""); // Remove hyphens if any

            if (!insurance_number) {
                throw new AppError("insurance_number is required", STATUS_CODES.BAD_REQUEST);
            }

            insurance_number = insurance_number.trim();

            if (insurance_number.length < INSURANCE_NUMBER_MIN_LENGTH || insurance_number.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`insurance_number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters long`, STATUS_CODES.BAD_REQUEST);
            }

            if (!first_name) {
                throw new AppError("first_name is required", STATUS_CODES.BAD_REQUEST);
            }

            first_name = first_name.trim().toLowerCase();

            if (first_name.length === 0) {
                throw new AppError("first_name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!last_name) {
                throw new AppError("last_name is required", STATUS_CODES.BAD_REQUEST);
            }

            last_name = last_name.trim().toLowerCase();

            if (last_name.length === 0) {
                throw new AppError("last_name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!policy_holder_name) {
                throw new AppError("policy_holder_name is required", STATUS_CODES.BAD_REQUEST);
            }

            policy_holder_name = policy_holder_name.trim().toLowerCase();

            if (policy_holder_name.length === 0) {
                throw new AppError("policy_holder_name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!relationship_to_holder) {
                throw new AppError("relationship_to_holder is required", STATUS_CODES.BAD_REQUEST);
            }

            relationship_to_holder = relationship_to_holder.trim().toLowerCase();

            if (!VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER.includes(relationship_to_holder)) {
                throw new AppError(`relationship_to_holder must be one of the following: ${VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER.join(", ")}`, STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM person_insurance_view
                WHERE
                cnic = $1 AND
                first_name = $2 AND
                last_name = $3 AND
                insurance_number = $4 AND
                policy_holder_name = $5 AND
                relationship_to_holder = $6`,
                values: [cnic, first_name, last_name, insurance_number, policy_holder_name, relationship_to_holder],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Error in PersonInsuranceService.verifyPersonInsurance: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PersonInsuranceService };