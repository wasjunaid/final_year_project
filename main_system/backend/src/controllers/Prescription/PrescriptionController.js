const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PrescriptionService } = require("../../services/Prescription/PrescriptionService");

class PrescriptionController {
    async getCurrentPrescriptionsForPatient(req, res) {
        try {
            const { person_id } = req.user;

            const prescriptions = await PrescriptionService.getCurrentPrescriptionsForPatient(person_id);
            if (!prescriptions) {
                throw new AppError('No current prescriptions found for the patient', STATUS_CODES.NOT_FOUND);
            }
            
            return res.status(STATUS_CODES.OK).json({
                data: prescriptions,
                message: 'Current prescriptions retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PrescriptionController.getCurrentPrescriptionsForPatient: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getCurrentPrescriptionsForDoctor(req, res) {
        try {
            const { patient_id } = req.params;

            const prescriptions = await PrescriptionService.getCurrentPrescriptionsForDoctor(patient_id);
            if (!prescriptions) {
                throw new AppError('No current prescriptions found for the patient', STATUS_CODES.NOT_FOUND);
            }
            return res.status(STATUS_CODES.OK).json({
                data: prescriptions,
                message: 'Current prescriptions for doctor retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PrescriptionController.getCurrentPrescriptionsForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getPrescriptionsAgainstAppointmentIfExists(req, res) {
        try {
            const { person_id } = req.user;
            const appointment_id = req.query?.appointment_id || req.params?.appointment_id || req.body?.appointment_id;

            const prescriptions = await PrescriptionService.getPrescriptionsAgainstAppointmentIfExists(person_id, appointment_id);
            if (!prescriptions) {
                throw new AppError('No prescriptions found for the given appointment', STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: prescriptions,
                message: 'Prescriptions retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PrescriptionController.getPrescriptionsAgainstAppointmentIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPrescription(req, res) {
        try {
            const { person_id, role } = req.user;
            const { appointment_id, medicine_id, dosage, instruction, prescription_date } = req.body;  

            const newPrescription = await PrescriptionService.insertPrescription({
                person_id,
                role,
                appointment_id,
                medicine_id,
                dosage,
                instruction,
                prescription_date
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: newPrescription,
                message: 'Prescription created successfully',
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in PrescriptionController.insertPrescription: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async removeFromCurrentPrescriptions(req, res) {
        try {
            const { prescription_id } = req.params;

            await PrescriptionService.removeFromCurrentPrescriptions(prescription_id);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: 'Prescription removed from current prescriptions successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in PrescriptionController.removeFromCurrentPrescriptions: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PrescriptionController();