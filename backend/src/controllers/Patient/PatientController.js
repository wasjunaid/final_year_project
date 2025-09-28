const { statusCodes } = require("../../utils/statusCodesUtil");
const { PatientService } = require("../../services/Patient/PatientService");

class PatientController {
    async getPatient(req, res) {
        const { person_id } = req.user;

        try {
            const patient = await PatientService.getPatient(person_id);

            return res.status(statusCodes.OK).json({
                data: patient,
                message: 'Patient retrieved successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error getting patient: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Patient',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPatient(req, res) {
        const { person_id } = req.body;

        try {
            const result = await PatientService.insertPatient(person_id);

            return res.status(statusCodes.CREATED).json({
                data: result,
                message: 'Patient inserted successfully',
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error inserting patient: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Insert Patient',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updatePatient(req, res) {
        const { person_id } = req.user;

        try {
            const result = await PatientService.updatePatient(person_id, {});

            return res.status(statusCodes.OK).json({
                data: result,
                message: 'Patient updated successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error updating patient: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Update Patient',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deletePatient(req, res) {
        const { person_id } = req.user;

        try {
            await PatientService.deletePatient(person_id);

            return res.status(statusCodes.OK).json({
                data: null,
                message: 'Patient deleted successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error deleting patient: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Delete Patient',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PatientController();