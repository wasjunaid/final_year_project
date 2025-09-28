const { statusCodes } = require("../../utils/statusCodesUtil");
const { PersonContactService } = require("../../services/Person/PersonContactService");

class PersonContactController {
    async getPersonContacts(req, res) {
        const { person_id } = req.user;

        try {
            const contacts = await PersonContactService.getPersonContacts(person_id);

            return res.status(statusCodes.OK).json({
                data: contacts,
                message: "Person contacts retrieved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error retrieving person contacts: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal server error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPersonContact(req, res) {
        const { person_id } = req.user;
        const { country_code, number, is_primary } = req.body;

        try {
            is_primary = (is_primary === undefined) ? true : is_primary;

            const contact = await PersonContactService.insertPersonContact(person_id, country_code, number, is_primary);

            return res.status(statusCodes.CREATED).json({
                data: contact,
                message: "Person contact inserted successfully",
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error inserting person contact: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal server error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updatePersonContact(req, res) {
        const { person_contact_id } = req.params;
        const { country_code, number, is_primary } = req.body;

        try {
            const contact = await PersonContactService.updatePersonContact(person_contact_id, { 
                country_code,
                number,
                is_primary
            });

            return res.status(statusCodes.OK).json({
                data: contact,
                message: "Person contact updated successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error updating person contact: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal server error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deletePersonContact(req, res) {
        const { person_contact_id } = req.params;

        try {
            await PersonContactService.deletePersonContact(person_contact_id);

            return res.status(statusCodes.OK).json({
                data: null,
                message: "Person contact deleted successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error deleting person contact: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal server error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PersonContactController();