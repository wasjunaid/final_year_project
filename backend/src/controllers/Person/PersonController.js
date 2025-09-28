const { statusCodes } = require("../../utils/statusCodesUtil");
const { PersonService } = require("../../services/Person/PersonService");

class PersonController {
    async getPerson(req, res) {
        const { person_id } = req.user;

        try {
            const person = await PersonService.getPerson(person_id);

            return res.status(statusCodes.OK).json({
                data: person,
                message: 'Person retrieved successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error getting person: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Person',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getPersons(req, res) {
        try {
            const persons = await PersonService.getPersons();

            return res.status(statusCodes.OK).json({
                data: persons,
                message: 'Persons retrieved successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error getting persons: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Persons',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPerson(req, res) {
        try {
            const { email, password } = req.body;

            const insertedPerson = await PersonService.insertPerson(email, password);

            return res.status(statusCodes.CREATED).json({
                data: insertedPerson.data,
                message: 'Person created successfully',
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error inserting person: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Insert Person',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updatePerson(req, res) {
        const { person_id } = req.user;
        const { first_name, last_name, email, gender, date_of_birth, blood_group, address_id } = req.body;

        try {
            const updates = {
                first_name,
                last_name,
                email,
                gender,
                date_of_birth,
                blood_group,
                address_id
            };
            for (const key in updates) {
                if (updates[key] === undefined) {
                    delete updates[key];
                }
            }

            const updatedPerson = await PersonService.updatePerson(person_id, updates);
            
            return res.status(statusCodes.OK).json({
                data: updatedPerson,
                message: 'Person updated successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error updating person: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Update Person',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updatePersonPasswordHash(req, res) {
        const { token, password } = req.body;

        try {
            await PersonService.updatePersonPasswordHash(token, password);

            return res.status(statusCodes.OK).json({
                data: null,
                message: 'Person password updated successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error updating person password: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Update Person Password',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updatePersonIsVerified(req, res) {
        const { token } = req.user;

        try {
            await PersonService.updatePersonIsVerified(token);

            return res.status(statusCodes.OK).json({
                data: null,
                message: 'Person verified successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error verifying person: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Verify Person',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deletePerson(req, res) {
        const { person_id } = req.user;

        try {
            await PersonService.deletePerson(person_id);

            return res.status(statusCodes.OK).json({
                data: null,
                message: 'Person deleted successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error deleting person: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Delete Person',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PersonController();