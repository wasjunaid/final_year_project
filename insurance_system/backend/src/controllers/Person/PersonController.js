const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PersonService } = require("../../services/Person/PersonService");
const { CNIC_REGEX, CNIC_HYPHENATED_REGEX } = require("../../utils/validConstantsUtil");

class PersonController {
    async getPersonsIfExists(req, res) {
        try {
            const persons = await PersonService.getPersonsIfExists();
            if (!persons) {
                throw new AppError("No persons found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: persons,
                message: "Persons fetched successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in PersonController.getPersonsIfExists: ${error.message} ${error.status}`);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async insertPersonIfNotExists(req, res) {
        try {
            const { cnic, first_name, last_name } = req.body;

            if (!cnic) {
                throw new AppError("CNIC is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!CNIC_REGEX.test(cnic) && !CNIC_HYPHENATED_REGEX.test(cnic)) {
                throw new AppError("Invalid CNIC format", STATUS_CODES.BAD_REQUEST);
            }

            const cnicCleaned = cnic.replace(/-/g, ''); // Remove hyphens if any

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

            const person = await PersonService.insertPersonIfNotExists({
                cnic: cnicCleaned,
                first_name: normalizedFirstName,
                last_name: normalizedLastName
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: person,
                message: "Person inserted successfully",
                status: STATUS_CODES.CREATED,
                success: true,
            });
        } catch (error) {
            console.error(`Error in PersonController.insertPersonIfNotExists: ${error.message} ${error.status}`);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }
}

module.exports = new PersonController();