const { statusCodes } = require("../../utils/statusCodesUtil");
const { HospitalStaffService } = require("../../services/Hospital/HospitalStaffService");

class HospitalStaffController {
    async getHospitalStaff(req, res) {
        const { person_id } = req.user;

        try {
            const hospitalStaff = await HospitalStaffService.getHospitalStaff(person_id);

            res.status(statusCodes.OK).json({
                data: hospitalStaff,
                message: "Hospital staff fetched successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getHospitalStaff: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching hospital staff",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllHospitalStaff(req, res) {
        const { person_id } = req.user;
        const { hospital_id } = req.params;

        try {
            const hospitalStaff = await HospitalStaffService.getAllHospitalStaff(person_id, hospital_id);

            res.status(statusCodes.OK).json({
                data: hospitalStaff,
                message: "Hospital staff fetched successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getAllHospitalStaff: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({ 
                data: null,
                message: error.message || "Error fetching hospital staff",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertHospitalStaff(req, res) {
        const { person_id } = req.user;
        const { email, hospital_id, role } = req.body;
        
        try {
            const newHospitalStaff = await HospitalStaffService.insertHospitalStaff(person_id, {
                email,
                hospital_id,
                role
            });

            res.status(statusCodes.CREATED).json({
                data: newHospitalStaff,
                message: "Hospital staff created successfully",
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in insertHospitalStaff: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({ 
                data: null,
                message: error.message || "Error creating hospital staff",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteHospitalStaff(req, res) {
        const { person_id } = req.user;
        const { hospital_staff_id } = req.params;

        try {
            await HospitalStaffService.deleteHospitalStaff(person_id, hospital_staff_id);

            res.status(statusCodes.OK).json({
                data: null,
                message: "Hospital staff deleted successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in deleteHospitalStaff: ${error.message}`);
            res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error deleting hospital staff",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new HospitalStaffController();