const { statusCodes } = require("../../utils/statusCodesUtil");
const { DoctorService } = require("../../services/Doctor/DoctorService");

class DoctorController {
    async getDoctor(req, res) {
        const { person_id } = req.user;

        try {
            const doctor = await DoctorService.getDoctor(person_id);

            return res.status(statusCodes.OK).json({
                data: doctor,
                message: 'Doctor retrieved successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error getting doctor: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Doctor',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getDoctorsForHospital(req, res) {
        const { person_id } = req.user;
        const { hospital_id } = req.params;

        try {
            const doctors = await DoctorService.getDoctorsForHospital(person_id, hospital_id);

            return res.status(statusCodes.OK).json({
                data: doctors,
                message: 'Doctors retrieved successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error getting doctors for hospital: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Doctors for Hospital',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getDoctorsForAppointments(req, res) {
        try {
            const doctors = await DoctorService.getDoctorsForAppointments();

            return res.status(statusCodes.OK).json({
                data: doctors,
                message: 'Doctors retrieved successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error getting doctors for appointments: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Get Doctors for Appointments',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertDoctor(req, res) {
        const { person_id } = req.body;

        try {
            const result = await DoctorService.insertDoctor(person_id);

            return res.status(statusCodes.CREATED).json({
                data: result,
                message: 'Doctor inserted successfully',
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error inserting doctor: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Insert Doctor',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateDoctor(req, res) {
        const { person_id } = req.user;
        const { specialization, license_number, years_of_experience, sitting_start, sitting_end } = req.body;

        try {
            const updates = {
                specialization,
                license_number,
                years_of_experience,
                sitting_start,
                sitting_end
            };
            for (const key in updates) {
                if (updates[key] === undefined) {
                    delete updates[key];
                }
            }

            const result = await DoctorService.updateDoctor(person_id, updates);

            return res.status(statusCodes.OK).json({
                data: result.rows[0],
                message: 'Doctor updated successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error updating doctor: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Update Doctor',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async updateDoctorStatus(req, res) {
        const { person_id } = req.user;
        const { doctor_id } = req.params;
        const { status } = req.body;

        try {
            const result = await DoctorService.updateDoctorStatus(person_id, doctor_id, status);

            return res.status(statusCodes.OK).json({
                data: result,
                message: 'Doctor status updated successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error updating doctor status: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Update Doctor Status',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteDoctor(req, res) {
        const { person_id } = req.user;

        try {
            await DoctorService.deleteDoctor(person_id);

            return res.status(statusCodes.OK).json({
                data: null,
                message: 'Doctor deleted successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error deleting doctor: ${error.message}`);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Unable to Delete Doctor',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new DoctorController();