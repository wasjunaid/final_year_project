const { PersonService } = require("./PersonService");
const { AddressService } = require("../Address/AddressService");
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

            let address;
            if (person.address_id !== null) {
                address = await AddressService.getAddress(person.address_id);
            }

            let contacts;
            const checkContactsExists = await PersonContactService.checkPersonContactsExists(person_id);
            if (checkContactsExists) {
                contacts = await PersonContactService.getPersonContacts(person_id);
            }

            return { personDetails: person, addressDetails: address || null, contactDetails: contacts || null };
        } catch (error) {
            console.error(`Error getting person profile: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PersonProfileService };