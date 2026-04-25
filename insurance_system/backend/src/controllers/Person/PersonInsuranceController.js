const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PersonInsuranceService } = require("../../services/Person/PersonInsuranceService");
const { validateID } = require("../../utils/idUtil");
const { VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER, INSURANCE_NUMBER_MAX_LENGTH, INSURANCE_NUMBER_MIN_LENGTH, CNIC_REGEX, CNIC_HYPHENATED_REGEX } = require("../../utils/validConstantsUtil");

class PersonInsuranceController {
    async getPersonInsurancesIfExists(req, res) {
        try {
            const { user_id } = req.user;

            const personInsurances = await PersonInsuranceService.getPersonInsurancesIfExists(user_id);
            if (!personInsurances) {
                throw new AppError("No person insurances found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: personInsurances,
                message: "Person insurances fetched successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in PersonInsuranceController.getPersonInsurancesIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async insertPersonInsurance(req, res) {
        try {
            const { user_id } = req.user;
            const { cnic, insurance_number, relationship_to_holder } = req.body;

            if (!cnic) {
                throw new AppError("cnic is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!CNIC_REGEX.test(cnic) && !CNIC_HYPHENATED_REGEX.test(cnic)) {
                throw new AppError("Invalid cnic format", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedCnic = cnic.replace(/-/g, ""); // remove hyphens if any

            if (!insurance_number) {
                throw new AppError("insurance_number is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedInsurnaceNumber = insurance_number.trim();

            if (normalizedInsurnaceNumber.length < INSURANCE_NUMBER_MIN_LENGTH || normalizedInsurnaceNumber.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`insurance_number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
            }

            if (!relationship_to_holder) {
                throw new AppError("relationship_to_holder is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedRelationshipToHolder = relationship_to_holder.trim().toLowerCase();

            if (!VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER.includes(normalizedRelationshipToHolder)) {
                throw new AppError("Invalid relationship_to_holder", STATUS_CODES.BAD_REQUEST);
            }

            const personInsurance = await PersonInsuranceService.insertPersonInsurance({
                user_id,
                cnic: normalizedCnic,
                insurance_number: normalizedInsurnaceNumber,
                relationship_to_holder: normalizedRelationshipToHolder,
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: personInsurance,
                message: "Person insurance inserted successfully",
                status: STATUS_CODES.CREATED,
                success: true,
            });
        } catch (error) {
            console.error(`Error in PersonInsuranceController.insertPersonInsurance: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async deletePersonInsurance(req, res) {
        try {
            const { user_id } = req.user;
            const { person_insurance_id } = req.params;

            if (!person_insurance_id) {
                throw new AppError("person_insurance_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedPersonInsuranceID = validateID(person_insurance_id);

            await PersonInsuranceService.deletePersonInsurance(user_id, validatedPersonInsuranceID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Person insurance deleted successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in PersonInsuranceController.deletePersonInsurance: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }
}

module.exports = new PersonInsuranceController();