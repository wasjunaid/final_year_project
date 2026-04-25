const { STATUS_CODES } = require("../utils/statusCodesUtil");
const { AppError } = require("../classes/AppErrorClass");
const { PersonInsuranceService } = require("../services/Person/PersonInsuranceService");
const { CNIC_REGEX, CNIC_MAX_LENGTH, INSURANCE_NUMBER_MIN_LENGTH, INSURANCE_NUMBER_MAX_LENGTH, VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER } = require("../utils/validConstantsUtil");

class VerifyInsuranceController {
    async verifyPersonInsurance(req, res) {
        try {
            const { cnic, first_name, last_name, insurance_number, policy_holder_name, relationship_to_holder } = req.body;

            if (!cnic) {
                throw new AppError("CNIC is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!CNIC_REGEX.test(cnic) || cnic.length > CNIC_MAX_LENGTH) {
                throw new AppError("Invalid CNIC format", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedCnic = cnic.replace(/-/g, '');

            if (!first_name) {
                throw new AppError("First name is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedFirstName = first_name.trim().toLowerCase();

            if (normalizedFirstName.length === 0) {
                throw new AppError("First name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!last_name) {
                throw new AppError("Last name is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedLastName = last_name.trim().toLowerCase();

            if (normalizedLastName.length === 0) {
                throw new AppError("Last name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_number) {
                throw new AppError("Insurance number is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedInsuranceNumber = insurance_number.trim();

            if (normalizedInsuranceNumber.length < INSURANCE_NUMBER_MIN_LENGTH || normalizedInsuranceNumber.length > INSURANCE_NUMBER_MAX_LENGTH) {
                throw new AppError(`Insurance number must be between ${INSURANCE_NUMBER_MIN_LENGTH} and ${INSURANCE_NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
            }

            if (!policy_holder_name) {
                throw new AppError("Policy holder name is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedPolicyHolderName = policy_holder_name.trim().toLowerCase();

            if (normalizedPolicyHolderName.length === 0) {
                throw new AppError("Policy holder name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!relationship_to_holder) {
                throw new AppError("Relationship to holder is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedRelationshipToHolder = relationship_to_holder.trim().toLowerCase();

            if (!VALID_PERSON_INSURANCE_RELATIONSHIP_TO_HOLDER.includes(normalizedRelationshipToHolder)) {
                throw new AppError("Invalid relationship to holder", STATUS_CODES.BAD_REQUEST);
            }

            const exists = await PersonInsuranceService.verifyPersonInsurance({
                cnic: normalizedCnic,
                first_name: normalizedFirstName,
                last_name: normalizedLastName,
                insurance_number: normalizedInsuranceNumber,
                policy_holder_name: normalizedPolicyHolderName,
                relationship_to_holder: normalizedRelationshipToHolder
            });
            if (!exists) {
                throw new AppError("Person insurance verification failed", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: exists,
                message: "Person insurance verification successful",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in VerifyInsuranceController.verifyPersonInsurance: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }
}

module.exports = new VerifyInsuranceController();