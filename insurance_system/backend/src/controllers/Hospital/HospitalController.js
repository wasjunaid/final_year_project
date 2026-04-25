const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { HospitalService } = require("../../services/Hospital/HospitalService");
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

class HospitalController {
    async getHospitalsIfExists(req, res) {
        try {
            const hospitals = await HospitalService.getHospitalsIfExists();
            if (!hospitals) {
                throw new AppError("No hospitals found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: hospitals,
                message: "Hospitals fetched successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalController.getHospitalsIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertHospital(req, res) {
        try {
            const {
                hospital_id,
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

            const normalizedName = name.trim().toLowerCase();
            if (normalizedName.length === 0) {
                throw new AppError("name cannot be empty or whitespace", STATUS_CODES.BAD_REQUEST);
            }

            const hospital = await HospitalService.insertHospital({
                hospital_id,
                name: normalizedName,
                focal_person_name: normalizeOptionalField(focal_person_name),
                focal_person_email: normalizeOptionalField(focal_person_email),
                focal_person_phone: normalizeOptionalField(focal_person_phone),
                address: normalizeOptionalField(address),
                wallet_address: normalizeOptionalField(wallet_address),
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: hospital,
                message: "Hospital created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalController.insertHospital: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateHospital(req, res) {
        try {
            const { hospital_id } = req.params;
            const {
                name,
                focal_person_name,
                focal_person_email,
                focal_person_phone,
                address,
                wallet_address,
            } = req.body;

            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalID = validateID(hospital_id);

            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedName = name.trim().toLowerCase();
            if (normalizedName.length === 0) {
                throw new AppError("name cannot be empty or whitespace", STATUS_CODES.BAD_REQUEST);
            }

            const hospital = await HospitalService.updateHospital({
                hospital_id: validatedHospitalID,
                name: normalizedName,
                focal_person_name: normalizeOptionalField(focal_person_name),
                focal_person_email: normalizeOptionalField(focal_person_email),
                focal_person_phone: normalizeOptionalField(focal_person_phone),
                address: normalizeOptionalField(address),
                wallet_address: normalizeOptionalField(wallet_address),
            });

            return res.status(STATUS_CODES.OK).json({
                data: hospital,
                message: "Hospital updated successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalController.updateHospital: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteHospital(req, res) {
        try {
            const { hospital_id } = req.params;

            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalID = validateID(hospital_id);

            await HospitalService.deleteHospital(validatedHospitalID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Hospital deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalController.deleteHospital: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new HospitalController();