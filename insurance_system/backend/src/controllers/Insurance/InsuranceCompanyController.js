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
    async getInsuranceCompaniesIfExists(req, res) {
        try {
            const insuranceCompanies = await InsuranceCompanyService.getInsuranceCompaniesIfExists();
            if (!insuranceCompanies) {
                // throw new AppError("No insurance companies found", STATUS_CODES.NOT_FOUND);
                return res.status(STATUS_CODES.OK).json({
                    data: [],
                    message: "No insurance companies found",
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            return res.status(STATUS_CODES.OK).json({
                data: insuranceCompanies,
                message: "Insurance companies fetched successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceCompanyController.getInsuranceCompaniesIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertInsuranceCompany(req, res) {
        try {
            const {
                name,
                focal_person_name,
                focal_person_email,
                focal_person_phone,
                address,
            } = req.body;

            if (!name) {
                throw new AppError("Name is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedName = name.trim().toLowerCase();
            if (normalizedName.length === 0) {
                throw new AppError("Name cannot be empty or whitespace", STATUS_CODES.BAD_REQUEST);
            }

            const insuranceCompany = await InsuranceCompanyService.insertInsuranceCompany({
                name: normalizedName,
                focal_person_name: normalizeOptionalField(focal_person_name),
                focal_person_email: normalizeOptionalField(focal_person_email),
                focal_person_phone: normalizeOptionalField(focal_person_phone),
                address: normalizeOptionalField(address),
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: insuranceCompany,
                message: "Insurance company created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceCompanyController.insertInsuranceCompany: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
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
                wallet_address,
                focal_person_name,
                focal_person_email,
                focal_person_phone,
                address,
            } = req.body;

            if (!insurance_company_id) {
                throw new AppError("insurance company ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedInsuranceCompanyID = validateID(insurance_company_id);

            if (!name) {
                throw new AppError("Name is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedName = name.trim().toLowerCase();
            if (normalizedName.length === 0) {
                throw new AppError("Name cannot be empty or whitespace", STATUS_CODES.BAD_REQUEST);
            }

            const insuranceCompany = await InsuranceCompanyService.updateInsuranceCompany({
                insurance_company_id: validatedInsuranceCompanyID,
                name: normalizedName,
                wallet_address,
                focal_person_name: normalizeOptionalField(focal_person_name),
                focal_person_email: normalizeOptionalField(focal_person_email),
                focal_person_phone: normalizeOptionalField(focal_person_phone),
                address: normalizeOptionalField(address),
            });

            return res.status(STATUS_CODES.OK).json({
                data: insuranceCompany,
                message: "Insurance company updated successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceCompanyController.updateInsuranceCompany: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteInsuranceCompany(req, res) {
        try {
            const { insurance_company_id } = req.params;

            if (!insurance_company_id) {
                throw new AppError("insurance company ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedInsuranceCompanyID = validateID(insurance_company_id);

            await InsuranceCompanyService.deleteInsuranceCompany(validatedInsuranceCompanyID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Insurance company deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in InsuranceCompanyController.deleteInsuranceCompany: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new InsuranceCompanyController();