const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { LabTestService } = require("../../services/LabTest/LabTestService");
const { validateID } = require("../../utils/idUtil");

class LabTestController {
    async getAllLabTestsIfExists(req, res) {
        try {
            const { person_id, role } = req.user;

            const labTests = await LabTestService.getAllLabTestsIfExists(person_id, role);
            if (!labTests) {
                // throw new AppError("No lab tests found", STATUS_CODES.NOT_FOUND);
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: "No lab tests found",
                    status: STATUS_CODES.OK,
                    success: true,
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: labTests,
                message: "Lab tests fetched successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in LabTestController.getAllLabTestsIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async insertLabTest(req, res) {
        try {
            const { person_id } = req.user;
            const { name, description, cost } = req.body;

            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof name !== 'string') {
                throw new AppError("name must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedName = name.trim().toLowerCase();
            
            if (normalizedName.length === 0) {
                throw new AppError("name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!description) {
                throw new AppError("description is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof description !== 'string') {
                throw new AppError("description must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedDescription = description.trim();
            
            if (normalizedDescription.length === 0) {
                throw new AppError("description cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (cost === undefined || cost === null) {
                throw new AppError("cost is required", STATUS_CODES.BAD_REQUEST);
            }

            if (isNaN(cost) || cost < 0) {
                throw new AppError("cost must be a non-negative number", STATUS_CODES.BAD_REQUEST);
            }

            const newLabTest = await LabTestService.insertLabTest({ person_id, name: normalizedName, description: normalizedDescription, cost });

            return res.status(STATUS_CODES.CREATED).json({
                data: newLabTest,
                message: "Lab test inserted successfully",
                status: STATUS_CODES.CREATED,
                success: true,
            });
        } catch (error) {
            console.error(`Error in LabTestController.insertLabTest: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async updateLabTest(req, res) {
        try {
            const { person_id } = req.user;
            const { lab_test_id } = req.params;
            const { name, description, cost } = req.body;

            if (!lab_test_id) {
                throw new AppError("lab_test_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedLabTestID = validateID(lab_test_id);

            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof name !== 'string') {
                throw new AppError("name must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedName = name.trim().toLowerCase();
            
            if (normalizedName.length === 0) {
                throw new AppError("name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (!description) {
                throw new AppError("description is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof description !== 'string') {
                throw new AppError("description must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedDescription = description.trim();
            
            if (normalizedDescription.length === 0) {
                throw new AppError("description cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            if (cost === undefined || cost === null) {
                throw new AppError("cost is required", STATUS_CODES.BAD_REQUEST);
            }

            if (isNaN(cost) || cost < 0) {
                throw new AppError("cost must be a non-negative number", STATUS_CODES.BAD_REQUEST);
            }

            const updatedLabTest = await LabTestService.updateLabTest({ person_id, lab_test_id: validatedLabTestID, name: normalizedName, description: normalizedDescription, cost });

            return res.status(STATUS_CODES.OK).json({
                data: updatedLabTest,
                message: "Lab test updated successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in LabTestController.updateLabTest: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }
}

module.exports = new LabTestController();