const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { ICDService } = require("../../services/MedicalCoding/ICDService");

class ICDController {
    async getICDCodesIfExists(req, res) {
        try {
            const icdCodes = await ICDService.getICDCodesIfExists();
            if (!icdCodes) {
                throw new AppError("No ICD codes found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({ 
                data: icdCodes,
                message: "ICD codes retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in ICDController.getICDCodesIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getICDCodeIfExists(req, res) {
        try {
            const { icd_code } = req.params;
            
            const icdCode = await ICDService.getICDCodeIfExists(icd_code);
            if (!icdCode) {
                throw new AppError("ICD code not found", STATUS_CODES.NOT_FOUND);
            }
            
            return res.status(STATUS_CODES.OK).json({ 
                data: icdCode,
                message: "ICD code retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        }
        catch (error) {
            console.error(`Error in ICDController.getICDCodeIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertICDCodeIfNotExists(req, res) {
        try {
            const { icd_code, description } = req.body;
            
            const newICDCode = await ICDService.insertICDCodeIfNotExists(icd_code, description);
            
            return res.status(STATUS_CODES.CREATED).json({ 
                data: newICDCode,
                message: "ICD code inserted successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        }
        catch (error) {
            console.error(`Error in ICDController.insertICDCodeIfNotExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new ICDController();