const { PrescriptionService } = require("../../services/Prescription/PrescriptionService");
const { StatusCodes } = require("../../utils/statusCodesUtil");

class PrescriptionController {
    async getPrescriptionsAgainstAppointment(req, res) {
        const { appointment_id } = req.params;

        try {
            const prescriptions = await PrescriptionService.getPrescriptionsAgainstAppointment(appointment_id);

            res.status(StatusCodes.OK).json({
                data: prescriptions,
                message: "Prescriptions fetched successfully",
                status: StatusCodes.OK,
                success: true,
            });
        } catch (error) {
            console.error("Error in PrescriptionController.getPrescriptionsAgainstAppointment:", error);
            res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message,
                status: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async insertPrescription(req, res) {
        const { appointment_id, medicine_id, dosage, instruction } = req.body;

        try {
            const newPrescription = await PrescriptionService.insertPrescription({
                appointment_id,
                medicine_id,
                dosage,
                instruction
            });

            res.status(StatusCodes.CREATED).json({
                data: newPrescription,
                message: "Prescription created successfully",
                status: StatusCodes.CREATED,
                success: true,
            });
        } catch (error) {
            console.error("Error in PrescriptionController.insertPrescription:", error);
            res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message,
                status: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async updatePrescription(req, res) {
        const { prescription_id } = req.params;
        const { medicine_id, dosage, instruction } = req.body;

        try {
            const updatedPrescription = await PrescriptionService.updatePrescription(
                prescription_id, {
                    medicine_id,
                    dosage,
                    instruction
                }
            );

            res.status(StatusCodes.OK).json({
                data: updatedPrescription,
                message: "Prescription updated successfully",
                status: StatusCodes.OK,
                success: true,
            });
        } catch (error) {
            console.error("Error in PrescriptionController.updatePrescription:", error);
            res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message,
                status: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }

    async deletePrescription(req, res) {
        const { prescription_id } = req.params;

        try {
            await PrescriptionService.deletePrescription(prescription_id);

            res.status(StatusCodes.OK).json({
                message: "Prescription deleted successfully",
                status: StatusCodes.OK,
                success: true,
            });
        } catch (error) {
            console.error("Error in PrescriptionController.deletePrescription:", error);
            res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message,
                status: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
            });
        }
    }
}

module.exports = new PrescriptionController();