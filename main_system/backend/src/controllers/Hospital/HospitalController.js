const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { HospitalService } = require("../../services/Hospital/HospitalService");
const { DoctorService } = require("../../services/Doctor/DoctorService");
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
    async getHospitalIfExists(req, res) {
        try {
            const { hospital_id } = req.params;

            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalID = validateID(hospital_id);

            let hospital = await HospitalService.getHospitalIfExists(validatedHospitalID);
            if (!hospital) {
                throw new AppError("Hospital not found", STATUS_CODES.NOT_FOUND);
            }
            return res.status(STATUS_CODES.OK).json({
                data: hospital,
                message: "Hospital fetched successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        }
        catch (error) {
            console.error(`Error in HospitalController.getHospitalIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching hospital",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllHospitalsIfExists(req, res) {
        try {
            let hospitals = await HospitalService.getAllHospitalsIfExists();
            if (!hospitals) {
                // throw new AppError("No hospitals found", STATUS_CODES.NOT_FOUND);
                hospitals = [];
            }

            return res.status(STATUS_CODES.OK).json({
                data: hospitals,
                // message: "Hospitals fetched successfully",
                message: hospitals.length > 0 ? "Hospitals fetched successfully" : "No hospitals found",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalController.getAllHospitals: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching hospitals",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAssociatedStaff(req, res) {
        try {
            const { person_id } = req.user;

            let doctors = await DoctorService.getAllDoctorsAssociatedWithHospitalIfExistsForFrontend(person_id);
            if (!doctors) {
                // throw new AppError("No doctors found", STATUS_CODES.NOT_FOUND);
                doctors = [];
            }

            return res.status(STATUS_CODES.OK).json({
                data: { doctors: doctors },
                // message: 'Associated staff retrieved successfully',
                message: doctors.length > 0 ? 'Associated staff retrieved successfully' : 'No associated staff found',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalController.getAssociatedStaff: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to fetch associated staff',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertHospital(req, res) {
        try {
            const {
                name,
                focal_person_name,
                focal_person_email,
                focal_person_phone,
                address,
                hospitalization_daily_charge,
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

            const hospital = await HospitalService.insertHospital({
                name: normalizedName,
                focal_person_name: normalizeOptionalField(focal_person_name),
                focal_person_email: normalizeOptionalField(focal_person_email),
                focal_person_phone: normalizeOptionalField(focal_person_phone),
                address: normalizeOptionalField(address),
                hospitalization_daily_charge,
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
                message: error.message || "Error creating hospital",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateHospital(req, res) {
        try {
            const { person_id, role } = req.user;
            const { hospital_id } = req.params;
            const {
                name,
                wallet_address,
                focal_person_name,
                focal_person_email,
                focal_person_phone,
                address,
                hospitalization_daily_charge,
            } = req.body;

            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalID = validateID(hospital_id);

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

            if (!wallet_address) {
                throw new AppError("wallet_address is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof wallet_address !== 'string') {
                throw new AppError("wallet_address must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const normalized_wallet_address = wallet_address.trim();

            if (normalized_wallet_address.length === 0) {
                throw new AppError("wallet_address cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            const updatedHospital = await HospitalService.updateHospital({
                person_id,
                role,
                hospital_id: validatedHospitalID,
                name: normalizedName,
                wallet_address: normalized_wallet_address,
                focal_person_name: normalizeOptionalField(focal_person_name),
                focal_person_email: normalizeOptionalField(focal_person_email),
                focal_person_phone: normalizeOptionalField(focal_person_phone),
                address: normalizeOptionalField(address),
                hospitalization_daily_charge,
            });

            return res.status(STATUS_CODES.OK).json({
                data: updatedHospital,
                message: "Hospital updated successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalController.updateHospital: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error updating hospital",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new HospitalController();