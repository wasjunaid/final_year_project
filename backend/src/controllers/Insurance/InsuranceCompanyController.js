const { statusCodes } = require("../../utils/statusCodesUtil");
const { InsuranceCompanyService } = require("../../services/Insurance/InsuranceCompanyService");

class InsuranceCompanyController {
    async getInsuranceCompanies(req, res) {
        try {
            const insuranceCompanies = await InsuranceCompanyService.getInsuranceCompanies();

            res.status(statusCodes.OK).json({
                data: insuranceCompanies,
                message: "Insurance companies fetched successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in getInsuranceCompanies: ${error.message}`);
            res.status(error.statusCode || statusCodes.INTERNAL_SERVER_ERROR).json({ 
                data: null,
                message: error.message || "Error fetching insurance companies",
                status: error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertInsuranceCompany(req, res) {
        const { name } = req.body;

        try {
            const newInsuranceCompany = await InsuranceCompanyService.insertInsuranceCompany(name);

            res.status(statusCodes.CREATED).json({
                data: newInsuranceCompany,
                message: "Insurance company created successfully",
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in insertInsuranceCompany: ${error.message}`);
            res.status(error.statusCode || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error creating insurance company",
                status: error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateInsuranceCompany(req, res) {
        const { insurance_company_id } = req.params;
        const { name } = req.body;

        try {
            const updatedInsuranceCompany = await InsuranceCompanyService.updateInsuranceCompany(insurance_company_id, { name });

            res.status(statusCodes.OK).json({
                data: updatedInsuranceCompany,
                message: "Insurance company updated successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in updateInsuranceCompany: ${error.message}`);
            res.status(error.statusCode || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error updating insurance company",
                status: error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteInsuranceCompany(req, res) {
        const { insurance_company_id } = req.params;

        try {
            await InsuranceCompanyService.deleteInsuranceCompany(insurance_company_id);

            res.status(statusCodes.OK).json({
                data: null,
                message: "Insurance company deleted successfully",
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in deleteInsuranceCompany: ${error.message}`);
            res.status(error.statusCode || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error deleting insurance company",
                status: error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new InsuranceCompanyController();