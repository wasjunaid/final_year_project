const { PersonService } = require("./PersonService");
const { PersonAddressService } = require("./PersonAddressService");
const { PersonContactService } = require("./PersonContactService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class PersonProfileService {
    static async getPersonProfile(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const person = await PersonService.getPerson(person_id);
            const address = await PersonAddressService.getPersonAddress(person_id);
            const contacts = await PersonContactService.getPersonContacts(person_id);

            return { personDetails: person, addressDetails: address, contactDetails: contacts };
        } catch (error) {
            throw new AppError(`Error retrieving person profile: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { PersonProfileService };