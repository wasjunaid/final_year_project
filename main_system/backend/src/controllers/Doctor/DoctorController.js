const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DoctorService } = require("../../services/Doctor/DoctorService");
const { validateID } = require("../../utils/idUtil");
const { DOCTOR_LICENSE_NUMBER_MAX_LENGTH, DOCTOR_YEARS_OF_EXPERIENCE_MAX, TIME_REGEX } = require("../../utils/validConstantsUtil");

class DoctorController {
    async getDoctorIfExists(req, res) {
        try {
            const { person_id } = req.user;
            
            const doctor = await DoctorService.getDoctorIfExists(person_id);
            if (!doctor) {
                throw new AppError("Doctor not found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: doctor,
                message: 'Doctor retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DoctorController.getDoctorIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Doctor',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllDoctorsAssociatedWithHospitalIfExists(req, res) {
        try {
            const { person_id } = req.user;

            const doctors = await DoctorService.getAllDoctorsAssociatedWithHospitalIfExistsForFrontend(person_id);
            if (!doctors) {
                throw new AppError("No doctors found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: doctors,
                message: 'Doctors retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DoctorController.getAllDoctorsAssociatedWithHospital: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Doctors for Hospital',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllDoctorsForAppointmentBookingIfExists(req, res) {
        try {
            const doctors = await DoctorService.getAllDoctorsForAppointmentBookingIfExists();
            if (!doctors) {
                throw new AppError("No doctors found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: doctors,
                message: 'Doctors retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DoctorController.getAllDoctorsForAppointmentBooking: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Doctors for Appointments',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateDoctor(req, res) {
        try {
            const { person_id } = req.user;
            const { specialization, license_number, years_of_experience, sitting_start, sitting_end } = req.body;

            const updates = {
                specialization,
                license_number,
                years_of_experience,
                sitting_start,
                sitting_end
            };
            for (const key in updates) {
                if (updates[key] === undefined || updates[key] === null || updates[key] === '') {
                    delete updates[key];
                }
            }

            if (Object.keys(updates).length === 0) {
                throw new AppError("No valid fields to update", STATUS_CODES.BAD_REQUEST);
            }

            if (updates.years_of_experience) {
                updates.years_of_experience = Number(updates.years_of_experience);
                if (typeof updates.years_of_experience !== 'number' || !Number.isInteger(updates.years_of_experience) || updates.years_of_experience < 0 || updates.years_of_experience > DOCTOR_YEARS_OF_EXPERIENCE_MAX) {
                    throw new AppError(`years_of_experience must be a non-negative integer between 0 and ${DOCTOR_YEARS_OF_EXPERIENCE_MAX}`, STATUS_CODES.BAD_REQUEST);
                }
            }

            if (updates.sitting_start && !updates.sitting_end) {
                throw new AppError("sitting_end is required if sitting_start is provided", STATUS_CODES.BAD_REQUEST);
            }
            if (updates.sitting_end && !updates.sitting_start) {
                throw new AppError("sitting_start is required if sitting_end is provided", STATUS_CODES.BAD_REQUEST);
            }
            if (updates.sitting_start && updates.sitting_end) {
                if (!TIME_REGEX.test(updates.sitting_start)) {
                    throw new AppError("sitting_start must be a valid time in HH:MM:SS format", STATUS_CODES.BAD_REQUEST);
                }
                if (!TIME_REGEX.test(updates.sitting_end)) {
                    throw new AppError("sitting_end must be a valid time in HH:MM:SS format", STATUS_CODES.BAD_REQUEST);
                }
            }

            if (updates.sitting_start && updates.sitting_end && updates.sitting_start >= updates.sitting_end) {
                throw new AppError("sitting_start must be before sitting_end", STATUS_CODES.BAD_REQUEST);
            }
            if (updates.license_number) {
                updates.license_number = updates.license_number.trim();
                if (typeof updates.license_number !== 'string' || updates.license_number.length !== DOCTOR_LICENSE_NUMBER_MAX_LENGTH || isNaN(Number(updates.license_number))) {
                    throw new AppError(`license_number must be a non-empty number up to ${DOCTOR_LICENSE_NUMBER_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
                }
            }

            const doctor = await DoctorService.updateDoctor(person_id, updates);

            return res.status(STATUS_CODES.OK).json({
                data: doctor,
                message: 'Doctor updated successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DoctorController.updateDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Update Doctor',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateDoctorStatus(req, res) {
        try {
            const { person_id } = req.user;
            const { doctor_id } = req.params;
            const { status } = req.body;

            const validatedDoctorID = validateID(doctor_id);

            if (!status) {
                throw new AppError("status is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof status !== 'string') {
                throw new AppError("status must be a string", STATUS_CODES.BAD_REQUEST);
            }

            const result = await DoctorService.updateDoctorStatus({person_id, doctor_id: validatedDoctorID, status});

            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: 'Doctor status updated successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DoctorController.updateDoctorStatus: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Update Doctor Status',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateDoctorHospitalAssociationForDoctor(req, res) {
        try {
            const { person_id } = req.user;

            const result = await DoctorService.updateDoctorHospitalAssociationForDoctor(person_id);

            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: 'Doctor hospital association updated successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DoctorController.updateDoctorHospitalAssociationForDoctor: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Update Doctor Hospital Association',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateDoctorHospitalAssociationForHospital(req, res) {
        try {
            const { person_id } = req.user;
            const { doctor_id } = req.params;
            const { reassignment_mode, reassigned_doctor_id } = req.body || {};

            const validatedDoctorID = validateID(doctor_id);

            const result = await DoctorService.updateDoctorHospitalAssociationForHospital(person_id, validatedDoctorID, {
                reassignment_mode,
                reassigned_doctor_id,
            });

            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: 'Doctor hospital association removed successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DoctorController.updateDoctorHospitalAssociationForHospital: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Remove Doctor Hospital Association',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new DoctorController();