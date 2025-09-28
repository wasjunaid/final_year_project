const { pool } = require("../../config/databaseConfig");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { validDoctorStatuses } = require("../../database/doctor/doctorTableQuery");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class DoctorService {
    static async getDoctor(doctor_id) {
        if (!doctor_id) {
            throw new AppError('doctor_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT d.*,
                h.hospital_id,
                h.name AS hospital_name,
                a.address_id as hospital_address_id,
                a.address as hospital_address
                FROM doctor d
                JOIN hospital h ON d.hospital_id = h.hospital_id
                JOIN address a ON h.address_id = a.address_id
                WHERE
                doctor_id = $1`,
                values: [doctor_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('Doctor not found', statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error getting doctor: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async getDoctorsForHospital(person_id, hospital_id) {
        if (!person_id) {
            throw new AppError('person_id is required', statusCodes.BAD_REQUEST);
        }
        if (!hospital_id) {
            throw new AppError('hospital_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const checkStaffExists = await HospitalStaffService.checkHospitalStaffExistsAgainstHospitalID(person_id, hospital_id);
            if (!checkStaffExists) {
                throw new AppError('You are not authorized to view doctors for this hospital', statusCodes.FORBIDDEN);
            }
            if (checkStaffExists.role === 'lab technician') {
                throw new AppError('You are not authorized to view doctors for this hospital', statusCodes.FORBIDDEN);
            }

            const query = {
                text: `SELECT d.*,
                p.first_name,
                p.last_name,
                p.email,
                h.hospital_id,
                h.name AS hospital_name,
                a.address_id as hospital_address_id,
                a.address as hospital_address
                FROM doctor d
                JOIN person p ON d.doctor_id = p.person_id
                JOIN hospital h ON d.hospital_id = h.hospital_id
                JOIN address a ON h.address_id = a.address_id
                WHERE
                d.hospital_id = $1`,
                values: [hospital_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('No doctors found for this hospital', statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            throw new AppError(`Error getting doctors for hospital: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async getDoctorsForAppointments() {
        try {
            const query = {
                text: `SELECT d.*,
                p.first_name,
                p.last_name,
                p.email,
                h.hospital_id,
                h.name AS hospital_name,
                a.address_id as hospital_address_id,
                a.address as hospital_address
                FROM doctor d
                JOIN person p ON d.doctor_id = p.person_id
                JOIN hospital h ON d.hospital_id = h.hospital_id
                JOIN address a ON h.address_id = a.address_id
                WHERE
                d.status = 'active'`
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('No doctors found', statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting doctors for appointments: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new AppError(`Error getting doctors for appointments: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async insertDoctor(person_id) {
        if (!person_id) {
            throw new AppError('person_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `INSERT INTO doctor
                (person_id)
                VALUES
                ($1)
                RETURNING *`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError('Error inserting doctor', statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error inserting doctor: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async insertDoctorIfNotExists(person_id) {
        if (!person_id) {
            throw new AppError(`person_id is required`, statusCodes.BAD_REQUEST);
        }

        try {
            let doctor;
            const doctorExists = await this.checkDoctorExists(person_id);
            if (!doctorExists) {
                doctor = await this.insertDoctor(person_id);
            } else {
                doctor = await this.getDoctor(person_id);
            }

            return doctor;
        } catch (error) {
            throw new AppError(`Error inserting doctor: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async updateDoctor(doctor_id, updates) {
        if (!doctor_id) {
            throw new AppError('doctor_id is required', statusCodes.BAD_REQUEST);
        }
        if (Object.keys(updates).length === 0) {
            throw new AppError('No updates provided', statusCodes.BAD_REQUEST);
        }

        try {
            const fields = [];
            const values = [];
            let index = 1;

            for (const [key, value] of Object.entries(updates)) {
                fields.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }

            const query = {
                text: `UPDATE doctor
                SET ${fields.join(', ')},
                updated_at = CURRENT_TIMESTAMP
                WHERE
                doctor_id = $${index}
                RETURNING *`,
                values: [...values, doctor_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error updating doctor`, statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error updating doctor: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async updateDoctorStatus(person_id, doctor_id, status) {
        if (!person_id) {
            throw new AppError('person_id is required', statusCodes.BAD_REQUEST);
        }
        if (!doctor_id) {
            throw new AppError('doctor_id is required', statusCodes.BAD_REQUEST);
        }
        if (!status) {
            throw new AppError('status is required', statusCodes.BAD_REQUEST);
        }
        if (!validDoctorStatuses.includes(status)) {
            throw new AppError(`Invalid status`, statusCodes.BAD_REQUEST);
        }

        try {
            const checkStaffExists = await HospitalStaffService.checkHospitalStaffExists(person_id);
            if (!checkStaffExists) {
                throw new AppError('You are not authorized to update doctor status', statusCodes.FORBIDDEN);
            }
            if (checkStaffExists.role === 'lab technician') {
                throw new AppError('You are not authorized to update doctor status', statusCodes.FORBIDDEN);
            }
            const doctor = await this.checkDoctorExists(doctor_id);
            if (!doctor) {
                throw new AppError('Doctor not found', statusCodes.NOT_FOUND);
            }
            if (doctor.hospital_id !== checkStaffExists.hospital_id) {
                throw new AppError('You are not authorized to update doctor status for this hospital', statusCodes.FORBIDDEN);
            }

            const query = {
                text: `UPDATE doctor
                SET status = $1,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                doctor_id = $2
                RETURNING *`,
                values: [status, doctor_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error updating doctor status`, statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error updating doctor status: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async deleteDoctor(doctor_id) {
        if (!doctor_id) {
            throw new AppError('doctor_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM doctor
                WHERE
                doctor_id = $1
                RETURNING *`,
                values: [doctor_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError(`Error deleting doctor`, statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            throw new AppError(`Error deleting doctor: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async checkDoctorExists(doctor_id) {
        if (!doctor_id) {
            throw new AppError('doctor_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM doctor
                WHERE
                doctor_id = $1`,
                values: [doctor_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error checking if doctor exists: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async checkDoctorExistsAgainstHospitalID(doctor_id, hospital_id) {
        if (!doctor_id) {
            throw new AppError('doctor_id is required', statusCodes.BAD_REQUEST);
        }
        if (!hospital_id) {
            throw new AppError('hospital_id is required', statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM doctor
                WHERE
                doctor_id = $1 AND hospital_id = $2`,
                values: [doctor_id, hospital_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error checking if doctor exists: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { DoctorService };