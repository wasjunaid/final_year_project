const { MedicineService } = require("../../services/Medicine/MedicineService");
const { statusCodes } = require("../../utils/statusCodesUtil");

class MedicineController {
    async getMedicines(req, res) {
        try {
            const medicines = await MedicineService.getMedicines();

            return res.status(statusCodes.OK).json({
                data: medicines,
                message: "Medicines fetched successfully",
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

    async insertMedicine(req, res) {
        const { name } = req.body;

        try {
            const newMedicine = await MedicineService.insertMedicine(name);

            return res.status(statusCodes.CREATED).json({
                data: newMedicine,
                message: "Medicine inserted successfully",
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

    async updateMedicine(req, res) {
        const { medicine_id } = req.params;
        const { name } = req.body;

        try {
            const updatedMedicine = await MedicineService.updateMedicine(medicine_id, name);

            return res.status(statusCodes.OK).json({
                data: updatedMedicine,
                message: "Medicine updated successfully",
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

module.exports = new MedicineController();