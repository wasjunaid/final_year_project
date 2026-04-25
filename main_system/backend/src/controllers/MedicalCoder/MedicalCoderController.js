const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { MedicalCoderService } = require("../../services/MedicalCoder/MedicalCoderService");

class MedicalCoderController {
    async getMedicalCoderIfExists(req, res) {
        try {
            const { person_id } = req.user;

            let medicalCoder = await MedicalCoderService.getMedicalCoderIfExists(person_id);
            if (!medicalCoder) {
                // throw new AppError("Medical coder not found", STATUS_CODES.NOT_FOUND);
                medicalCoder = await MedicalCoderService.insertMedicalCoderIfNotExists(person_id);
            }

            return res.status(STATUS_CODES.OK).json({
                data: medicalCoder,
                message: "Medical coder retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in MedicalCoderController.getMedicalCoderIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new MedicalCoderController();