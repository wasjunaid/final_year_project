const { statusCodes } = require("../../utils/statusCodesUtil");
const { HospitalService } = require("../../services/Hospital/HospitalService");

class HospitalController {
    async getHospitals(req, res) {
        try {
            const hospitals = await HospitalService.getHospitals();

            res.status(statusCodes.OK).json({
                data: hospitals,
                message: "Hospitals fetched successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getHospitals: ${error.message}`);
            res.status(error.statusCode || statusCodes.INTERNAL_SERVER_ERROR).json({ 
                data: null,
                message: error.message || "Error fetching hospitals",
                status: error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertHospital(req, res) {
        const { name, address } = req.body;

        try {
            const newHospital = await HospitalService.insertHospital(name, address );

            res.status(statusCodes.CREATED).json({
                data: newHospital,
                message: "Hospital created successfully",
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in insertHospital: ${error.message}`);
            res.status(error.statusCode || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error creating hospital",
                status: error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateHospital(req, res) {
        const { hospital_id } = req.params;
        const { name, address } = req.body;

        try {
            const updatedHospital = await HospitalService.updateHospital(hospital_id, { name, address });

            res.status(statusCodes.OK).json({
                data: updatedHospital,
                message: "Hospital updated successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in updateHospital: ${error.message}`);
            res.status(error.statusCode || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error updating hospital",
                status: error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteHospital(req, res) {
        const { hospital_id } = req.params;

        try {
            await HospitalService.deleteHospital(hospital_id);
            
            res.status(statusCodes.OK).json({
                data: null,
                message: "Hospital deleted successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in deleteHospital: ${error.message}`);
            res.status(error.statusCode || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error deleting hospital",
                status: error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new HospitalController();