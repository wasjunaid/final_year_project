const { statusCodes } = require("../../utils/statusCodesUtil");
const { PersonAddressService } = require("../../services/Person/PersonAddressService");

class PersonAddressController {
    async getPersonAddress(req, res) {
        const { person_id } = req.user;

        try {
            const address = await PersonAddressService.getPersonAddress(person_id);

            return res.status(statusCodes.OK).json({
                data: address,
                message: "Person address retrieved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error retrieving person address: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal server error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertOrUpdatePersonAddress(req, res) {
        const { person_id } = req.user;
        const { address } = req.body;

        try {
            const address_id = await PersonAddressService.insertOrUpdatePersonAddress(person_id, address);
            
            return res.status(statusCodes.OK).json({
                data: address_id,
                message: "Person address inserted/updated successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error inserting/updating person address: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal server error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PersonAddressController();