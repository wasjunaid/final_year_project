const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { InsuranceCompanyService } = require("../../services/Insurance/InsuranceCompanyService");
const { validateID } = require("../../utils/idUtil");

const normalizeOptionalField = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value !== "string") {
        throw new AppError("Optional fields must be strings", STATUS_CODES.BAD_REQUEST);
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
};

class InsuranceCompanyController {
    async getAllInsuranceCompaniesIfExists(req, res) {
        try {
            let insuranceCompanies = await InsuranceCompanyService.getAllInsuranceCompaniesIfExists();
            if (!insuranceCompanies) {
                // throw new AppError("No insurance companies found", STATUS_CODES.NOT_FOUND);
                insuranceCompanies = [];
            }

            return res.status(STATUS_CODES.OK).json({
                data: insuranceCompanies,
                // message: "Insurance companies fetched successfully",
                message: insuranceCompanies.length > 0 ? "Insurance companies fetched successfully" : "No insurance companies found",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceCompanyController.getAllInsuranceCompanies: ${error.message} ${error.status}`);
            res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
                data: null,
                message: error.message || "Error fetching insurance companies",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertInsuranceCompany(req, res) {
        try {
            const {
                insurance_company_id,
                name,
                focal_person_name,
                focal_person_email,
                focal_person_phone,
                address,
                wallet_address,
            } = req.body;

            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof name !== 'string') {
                throw new AppError("name must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedName = name.trim().toLowerCase();

            if (normalizedName.length === 0) {
                throw new AppError("name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            const newInsuranceCompany = await InsuranceCompanyService.insertInsuranceCompany({
                name: normalizedName,
                insurance_company_id,
                focal_person_name: normalizeOptionalField(focal_person_name),
                focal_person_email: normalizeOptionalField(focal_person_email),
                focal_person_phone: normalizeOptionalField(focal_person_phone),
                address: normalizeOptionalField(address),
                wallet_address: normalizeOptionalField(wallet_address),
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: newInsuranceCompany,
                message: "Insurance company created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceCompanyController.insertInsuranceCompany: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error creating insurance company",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateInsuranceCompany(req, res) {
        try {
            const { insurance_company_id } = req.params;
            const {
                name,
                focal_person_name,
                focal_person_email,
                focal_person_phone,
                address,
                wallet_address,
            } = req.body;

            if (!insurance_company_id) {
                throw new AppError("insurance_company_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedInsuranceCompanyID = validateID(insurance_company_id);

            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof name !== 'string') {
                throw new AppError("name must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedName = name.trim().toLowerCase();

            if (normalizedName.length === 0) {
                throw new AppError("name cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            const updatedInsuranceCompany = await InsuranceCompanyService.updateInsuranceCompany({
                insurance_company_id: validatedInsuranceCompanyID,
                name: normalizedName,
                focal_person_name: normalizeOptionalField(focal_person_name),
                focal_person_email: normalizeOptionalField(focal_person_email),
                focal_person_phone: normalizeOptionalField(focal_person_phone),
                address: normalizeOptionalField(address),
                wallet_address: normalizeOptionalField(wallet_address),
            });

            return res.status(STATUS_CODES.OK).json({
                data: updatedInsuranceCompany,
                message: "Insurance company updated successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceCompanyController.updateInsuranceCompany: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error updating insurance company",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new InsuranceCompanyController();