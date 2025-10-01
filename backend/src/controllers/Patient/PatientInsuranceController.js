const { statusCodes } = require("../../utils/statusCodesUtil");
const { PatientInsuranceService } = require("../../services/Patient/PatientInsuranceService");

class PatientInsuranceController {
    async getPatientInsurances(req, res) {
        const { person_id } = req.user;

        try {
            const insurances = await PatientInsuranceService.getPatientInsurances(person_id);

            return res.status(statusCodes.OK).json({
                data: insurances,
                message: "Insurances fetched successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error getting patient insurances: ${error.message} ${error.status}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPatientInsurance(req, res) {
        const { person_id } = req.user;
        const { insurance_number, insurance_company_id } = req.body;

        try {
            const newInsurance = await PatientInsuranceService.insertPatientInsurance(person_id, {
                insurance_number,
                insurance_company_id
            });

            return res.status(statusCodes.CREATED).json({
                data: newInsurance,
                message: "Insurance added successfully",
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error inserting patient insurance: ${error.message} ${error.status}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updatePatientInsurance(req, res) {
        const { person_id } = req.user;
        const { patient_insurance_id } = req.params;
        const { insurance_number, is_primary } = req.body;

        try {
            const updatedInsurance = await PatientInsuranceService.updatePatientInsurance(person_id, {
                patient_insurance_id,
                insurance_number,
                is_primary
            });

            return res.status(statusCodes.OK).json({
                data: updatedInsurance,
                message: "Insurance updated successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error updating patient insurance: ${error.message} ${error.status}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deletePatientInsurance(req, res) {
        const { patient_insurance_id } = req.params;

        try {
            await PatientInsuranceService.deletePatientInsurance(patient_insurance_id);

            return res.status(statusCodes.OK).json({
                data: null,
                message: "Insurance deleted successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error deleting patient insurance: ${error.message} ${error.status}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new PatientInsuranceController();