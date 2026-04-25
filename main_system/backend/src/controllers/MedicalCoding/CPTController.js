const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { CPTService } = require("../../services/MedicalCoding/CPTService");

class CPTController {
    async getCPTCodesIfExists(req, res) {
        try {
            const cptCodes = await CPTService.getCPTCodesIfExists();
            if (!cptCodes) {
                throw new AppError("No CPT codes found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({ 
                data: cptCodes,
                message: "CPT codes retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in CPTController.getCPTCodesIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getCPTCodeIfExists(req, res) {
        try {
            const { cpt_code } = req.params;
            
            const cptCode = await CPTService.getCPTCodeIfExists(cpt_code);
            if (!cptCode) {
                throw new AppError("CPT code not found", STATUS_CODES.NOT_FOUND);
            }
            
            return res.status(STATUS_CODES.OK).json({ 
                data: cptCode,
                message: "CPT code retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        }
        catch (error) {
            console.error(`Error in CPTController.getCPTCodeIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertCPTCodeIfNotExists(req, res) {
        try {
            const { cpt_code, description } = req.body;
            
            const newCPTCode = await CPTService.insertCPTCodeIfNotExists(cpt_code, description);

            return res.status(STATUS_CODES.CREATED).json({ 
                data: newCPTCode,
                message: "CPT code inserted successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        }
        catch (error) {
            console.error(`Error in CPTController.insertCPTCodeIfNotExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new CPTController();