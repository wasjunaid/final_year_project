const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { HospitalStaffService } = require("../../services/Hospital/HospitalStaffService");
const { validateID } = require("../../utils/idUtil");
const { validateEmail } = require("../../utils/emailUtil");

class HospitalStaffController {
    async getHospitalStaffIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExistsForFrontend(person_id);
            if (!hospitalStaff) {
                throw new AppError("Hospital staff not found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: hospitalStaff,
                message: "Hospital staff fetched successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalStaffController.getHospitalStaffIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching hospital staff",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllHospitalStaffIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const hospitalStaff = await HospitalStaffService.getAllHospitalStaffIfExistsForFrontend(person_id);
            if (!hospitalStaff) {
                throw new AppError("Hospital staff not found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: hospitalStaff,
                message: "Hospital staff fetched successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalStaffController.getAllHospitalStaffIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching hospital staff",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllHospitalAdminsIfExists(req, res) {
        try {
            const { search, is_active, is_verified } = req.query;

            const parseBooleanQuery = (value, fieldName) => {
                if (value === undefined || value === null || value === '') {
                    return undefined;
                }

                if (value === 'true') {
                    return true;
                }

                if (value === 'false') {
                    return false;
                }

                throw new AppError(`${fieldName} must be true or false`, STATUS_CODES.BAD_REQUEST);
            };

            if (search !== undefined && typeof search !== 'string') {
                throw new AppError('search must be a string', STATUS_CODES.BAD_REQUEST);
            }

            let hospitalAdmins = await HospitalStaffService.getAllHospitalAdminsIfExistsForFrontend({
                search: typeof search === 'string' ? search.trim() : undefined,
                is_active: parseBooleanQuery(is_active, 'is_active'),
                is_verified: parseBooleanQuery(is_verified, 'is_verified'),
            });
            if (!hospitalAdmins) {
                // throw new AppError("No hospital admins found", STATUS_CODES.NOT_FOUND);
                hospitalAdmins = [];
            }

            return res.status(STATUS_CODES.OK).json({
                data: hospitalAdmins,
                // message: "Hospital admins fetched successfully",
                message: hospitalAdmins.length > 0 ? "Hospital admins fetched successfully" : "No hospital admins found",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalStaffController.getAllHospitalAdminsIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error fetching hospital admins",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertHospitalStaff(req, res) {
        try {
            const { person_id } = req.user;
            const { email, hospital_id, role } = req.body;

            if (!email) {
                throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof email !== 'string') {
                throw new AppError("email must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const validatedEmail = validateEmail(email);

            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalID = validateID(hospital_id);

            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof role !== 'string') {
                throw new AppError("role must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const normalizedRole = role.trim().toLowerCase();

            if (normalizedRole.length === 0) {
                throw new AppError("role cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            const newHospitalStaff = await HospitalStaffService.insertHospitalStaff({
                person_id,
                email: validatedEmail,
                hospital_id: validatedHospitalID,
                role: normalizedRole
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: newHospitalStaff,
                message: "Hospital staff created successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalStaffController.insertHospitalStaff: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
                data: null,
                message: error.message || "Error creating hospital staff",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteHospitalStaff(req, res) {
        try {
            const { person_id } = req.user;
            const { hospital_staff_id } = req.params;

            if (!hospital_staff_id) {
                throw new AppError("hospital_staff_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalStaffID = validateID(hospital_staff_id);

            await HospitalStaffService.deleteHospitalStaff(person_id, validatedHospitalStaffID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Hospital staff deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalStaffController.deleteHospitalStaff: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Error deleting hospital staff",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateHospitalStaffStatus(req, res) {
        try {
            const { person_id } = req.user;
            const { hospital_staff_id } = req.params;
            const { is_active } = req.body;

            if (!hospital_staff_id) {
                throw new AppError("hospital_staff_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof is_active !== 'boolean') {
                throw new AppError('is_active must be a boolean', STATUS_CODES.BAD_REQUEST);
            }

            const validatedHospitalStaffID = validateID(hospital_staff_id);

            const statusResult = await HospitalStaffService.updateHospitalStaffActiveStatus({
                actor_person_id: person_id,
                hospital_staff_id: validatedHospitalStaffID,
                is_active,
            });

            return res.status(STATUS_CODES.OK).json({
                data: statusResult,
                message: `Hospital staff ${is_active ? 'activated' : 'deactivated'} successfully`,
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in HospitalStaffController.updateHospitalStaffStatus: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Error updating hospital staff status',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new HospitalStaffController();