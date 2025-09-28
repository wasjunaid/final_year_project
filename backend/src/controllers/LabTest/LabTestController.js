const { LabTestService } = require("../../services/LabTest/LabTestService");
const { statusCodes } = require("../../utils/statusCodesUtil");

class LabTestController {
    async getLabTests(req, res) {
        try {
            const labTests = await LabTestService.getLabTests();

            return res.status(statusCodes.OK).json({
                data: labTests,
                message: "Lab tests fetched successfully",
                status: statusCodes.OK,
                success: true,
            });
        } catch (error) {
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async insertLabTest(req, res) {
        const { name, description, cost } = req.body;
        try {
            const newLabTest = await LabTestService.insertLabTest(name, description, cost);

            return res.status(statusCodes.CREATED).json({
                data: newLabTest,
                message: "Lab test inserted successfully",
                status: statusCodes.CREATED,
                success: true,
            });
        } catch (error) {
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async updateLabTest(req, res) {
        const { lab_test_id } = req.params;
        const { name, description, cost } = req.body;

        try {
            const updatedLabTest = await LabTestService.updateLabTest(lab_test_id, { name, description, cost });

            return res.status(statusCodes.OK).json({
                data: updatedLabTest,
                message: "Lab test updated successfully",
                status: statusCodes.OK,
                success: true,
            });
        } catch (error) {
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }
}

module.exports = new LabTestController();