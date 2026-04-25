const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { MedicineService } = require("../../services/Medicine/MedicineService");

class MedicineController {
    async getAllMedicinesIfExists(req, res) {
        try {
            const medicines = await MedicineService.getAllMedicinesIfExists();
            if (!medicines) {
                throw new AppError("No medicines found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: medicines,
                message: "Medicines fetched successfully",
                status: STATUS_CODES.OK,
                success: true,
            });
        } catch (error) {
            console.error(`Error in MedicineController.getAllMedicinesIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async insertMedicine(req, res) {
        try {
            const { name } = req.body;

            const newMedicine = await MedicineService.insertMedicine(name);

            return res.status(STATUS_CODES.CREATED).json({
                data: newMedicine,
                message: "Medicine inserted successfully",
                status: STATUS_CODES.CREATED,
                success: true,
            });
        } catch (error) {
            console.error(`Error in MedicineController.insertMedicine: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }   
}

module.exports = new MedicineController();