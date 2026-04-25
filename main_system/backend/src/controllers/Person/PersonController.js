const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PersonService } = require("../../services/Person/PersonService");
const { CNIC_REGEX, CNIC_HYPHENATED_REGEX, VALID_GENDERS, NUMBER_MIN_LENGTH, NUMBER_MAX_LENGTH } = require("../../utils/validConstantsUtil");

class PersonController {
    async getPersonIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const person = await PersonService.getPersonIfExists(person_id);
            if (!person) {
                throw new AppError('Person not found', STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: person,
                message: 'Person retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PersonController.getPersonIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Person',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updatePerson(req, res) {
        try {
            const { person_id } = req.user;
            const { first_name, last_name, cnic, date_of_birth, gender, address, country_code, number } = req.body;

            const updates = {
                first_name,last_name, cnic, date_of_birth, gender, address, country_code, number
            };
            for (const key in updates) {
                if (updates[key] === undefined || updates[key] === null || updates[key] === '') {
                    delete updates[key];
                }
            }

            if (Object.keys(updates).length === 0) {
                throw new AppError('No fields to update', STATUS_CODES.BAD_REQUEST);
            }

            if (updates.first_name && typeof updates.first_name !== 'string' && updates.first_name.trim() === '') {
                throw new AppError('Invalid first_name', STATUS_CODES.BAD_REQUEST);
            }

            if (updates.last_name && typeof updates.last_name !== 'string' && updates.last_name.trim() === '') {
                throw new AppError('Invalid last_name', STATUS_CODES.BAD_REQUEST);
            }

            if (updates.cnic && !CNIC_REGEX.test(updates.cnic) && !CNIC_HYPHENATED_REGEX.test(updates.cnic)) {
                throw new AppError('Invalid CNIC format', STATUS_CODES.BAD_REQUEST);
            }

            if (updates.cnic) {
                updates.cnic = updates.cnic.replace(/-/g, ''); // Remove hyphens if present
            }

            if (updates.date_of_birth) {
                const dob = new Date(updates.date_of_birth);
                if (isNaN(dob.getTime())) {
                    throw new AppError('Invalid date_of_birth format', STATUS_CODES.BAD_REQUEST);
                }
                const today = new Date();
                if (dob > today) {
                    throw new AppError('Date of birth cannot be in the future', STATUS_CODES.BAD_REQUEST);
                }
            }

            if (updates.gender) {
                updates.gender = updates.gender.trim().toUpperCase();
                if (!VALID_GENDERS.includes(updates.gender)) {
                    throw new AppError('Invalid gender value', STATUS_CODES.BAD_REQUEST);
                }
            }

            if (updates.country_code && !updates.number) {
                throw new AppError('Both country_code and number are required to update contact', STATUS_CODES.BAD_REQUEST);
            }

            if (updates.number && !updates.country_code) {
                throw new AppError('Both country_code and number are required to update contact', STATUS_CODES.BAD_REQUEST);
            }

            if (updates.country_code && updates.number) {
                if (number.length < NUMBER_MIN_LENGTH || number.length > NUMBER_MAX_LENGTH) {
                    throw new AppError(`number must be between ${NUMBER_MIN_LENGTH} and ${NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
                }
            }

            const updatedPerson = await PersonService.updatePerson(person_id, updates);

            return res.status(STATUS_CODES.OK).json({
                data: updatedPerson,
                message: 'Person updated successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PersonController.updatePerson: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Update Person',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updatePersonPasswordHash(req, res) {
        try {
            const { person_id } = req.user;
            const { password, confirmPassword } = req.body;

            if (!password) {
                throw new AppError('Password is required', STATUS_CODES.BAD_REQUEST);
            }

            if (typeof password !== 'string') {
                throw new AppError('Password must be a string', STATUS_CODES.BAD_REQUEST);
            }

            if (!confirmPassword) {
                throw new AppError('Confirm Password is required', STATUS_CODES.BAD_REQUEST);
            }

            if (typeof confirmPassword !== 'string') {
                throw new AppError('Confirm Password must be a string', STATUS_CODES.BAD_REQUEST);
            }

            if (password !== confirmPassword) {
                throw new AppError('Passwords do not match', STATUS_CODES.BAD_REQUEST);
            }

            await PersonService.updatePersonPasswordHash(person_id, password);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: 'Person password updated successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PersonController.updatePersonPasswordHash: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Update Person Password',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deletePerson(req, res) {
        try {
            const { person_id } = req.user;

            await PersonService.deletePerson(person_id);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: 'Person deleted successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PersonController.deletePerson: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Delete Person',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PersonController();