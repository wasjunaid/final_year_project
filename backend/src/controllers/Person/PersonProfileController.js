const { statusCodes } = require("../../utils/statusCodesUtil");
const { PersonProfileService } = require("../../services/Person/PersonProfileService");

class PersonProfileController {
    async getPersonProfile(req, res) {
        const { person_id } = req.user;

        try {
            const profile = await PersonProfileService.getPersonProfile(person_id);

            return res.status(statusCodes.OK).json({
                data: profile,
                message: "Person profile retrieved successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error retrieving person profile: ${error.message}`);
            return res.status(error.statusCode || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PersonProfileController();