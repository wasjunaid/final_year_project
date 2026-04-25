const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { VALID_DOCTOR_STATUSES_OBJECT, VALID_DOCTOR_STATUSES, VALID_TABLES_OBJECT } = require("../../utils/validConstantsUtil");
const { VALID_APPOINTMENT_STATUSES_OBJECT } = require("../../validations/appointment/appointmentValidations");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const { HospitalService } = require("../Hospital/HospitalService");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { NotificationService } = require("../Notification/NotificationService");
const { LogService } = require("../Log/LogService");

class DoctorService {
    static async getFutureHospitalAppointmentsCount(doctor_id, hospital_id) {
        const futureAppointmentsQuery = {
            text: `SELECT COUNT(*)::INT AS total
            FROM appointment
            WHERE doctor_id = $1
            AND hospital_id = $2
            AND status IN ('${VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING}', '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}')
            AND date >= CURRENT_DATE`,
            values: [doctor_id, hospital_id],
        };

        const result = await DatabaseService.query(
            futureAppointmentsQuery.text,
            futureAppointmentsQuery.values
        );

        return result.rows[0]?.total || 0;
    }

    /**
     * Retrieves a doctor's details by their ID.
     * @param {number} doctor_id - The ID of the doctor to retrieve.
     * @returns {Promise<Object|boolean>} - The doctor's details or false if not found.
     * @throws {AppError} if any issue occurs
     */
    static async getDoctorIfExists(doctor_id) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM doctor_view
                WHERE
                doctor_id = $1`,
                values: [doctor_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in DoctorService.getDoctorIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all doctors associated with the hospital of the given person_id
     * @param {number} person_id - The ID of the person whose hospital's doctors are to be fetched
     * @returns {Promise<Array>} - A list of doctors associated with the hospital
     * @throws {AppError} if any issue occurs
     */
    static async getAllDoctorsAssociatedWithHospitalIfExists(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const checkStaffExists =
                await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!checkStaffExists) {
                throw new AppError(
                    "You are not authorized to view doctors",
                    STATUS_CODES.FORBIDDEN
                );
            }

            const query = {
                text: `SELECT d.*,
                p.first_name as doctor_first_name,
                p.last_name as doctor_last_name
                FROM doctor_view d
                JOIN person p on d.doctor_id = p.person_id
                WHERE
                d.hospital_id = $1`,
                values: [checkStaffExists.hospital_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in DoctorService.getAllDoctorsAssociatedWithHospital: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all doctors associated with the hospital of the given person_id
     * @param {number} person_id - The ID of the person whose hospital's doctors are to be fetched
     * @returns {Promise<Array>} - A list of doctors associated with the hospital
     * @throws {AppError} if any issue occurs
     */
    static async getAllDoctorsAssociatedWithHospitalIfExistsForFrontend(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const checkStaffExists =
                await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!checkStaffExists) {
                throw new AppError(
                    "You are not authorized to view doctors",
                    STATUS_CODES.FORBIDDEN
                );
            }

            const query = {
                text: `SELECT d.doctor_id,
                d.hospital_id,
                d.specialization,
                d.license_number,
                d.sitting_start,
                d.sitting_end,
                d.doctor_status,
                -- d.created_at,
                p.first_name as doctor_first_name,
                p.last_name as doctor_last_name,
                p.email as doctor_email
                FROM doctor_view d
                JOIN person p on d.doctor_id = p.person_id
                WHERE
                d.hospital_id = $1`,
                values: [checkStaffExists.hospital_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in DoctorService.getAllDoctorsAssociatedWithHospital: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all doctors available for appointment booking
     * @returns {Promise<Array>} list of all doctors
     * @throws {AppError} if any issue occurs
     */
    static async getAllDoctorsForAppointmentBookingIfExists() {
        try {
            const query = {
                text: `SELECT d.*,
                p.first_name as doctor_first_name,
                p.last_name as doctor_last_name
                FROM doctor_view d
                JOIN person p on d.doctor_id = p.person_id
                WHERE
                d.doctor_status = '${VALID_DOCTOR_STATUSES_OBJECT.ACTIVE}'`
            };
            const result = await DatabaseService.query(query.text);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in DoctorService.getAllDoctorsForAppointmentBooking: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a doctor into the database if not exists.
     * @param {number} person_id - The ID of the person.
     * @returns {Promise<Object>} - The inserted or updated doctor object.
     * @throws {AppError} - If any issue occurs.
     */
    static async insertDoctorIfNotExists(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO doctor
                (doctor_id)
                VALUES
                ($1)
                ON CONFLICT (doctor_id)
                DO
                UPDATE
                SET
                doctor_id = EXCLUDED.doctor_id
                RETURNING *`,
                values: [person_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(
                    "Error inserting doctor",
                    STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in DoctorService.insertDoctorIfNotExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Updates a doctor's details.
     * @param {number} doctor_id - The ID of the doctor to update.
     * @param {Object} updates - The updates to apply.
     * @returns {Promise<Object>} - The updated doctor object.
     * @throws {AppError} - If any issue occurs.
     */
    static async updateDoctor(doctor_id, updates = {}) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (Object.keys(updates).length === 0) {
                throw new AppError("No updates provided", STATUS_CODES.BAD_REQUEST);
            }

            const doctor = await this.getDoctorIfExists(doctor_id);
            if (!doctor) {
                throw new AppError("Doctor not found", STATUS_CODES.NOT_FOUND);
            }
            if (doctor.is_doctor_profile_complete) {
                if (updates.license_number) {
                    delete updates.license_number; // Prevent license_number updates
                }
            }

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
                SET ${fields.join(", ")}
                WHERE
                doctor_id = $${index}
                RETURNING *`,
                values: [...values, doctor_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(
                    `Error updating doctor`,
                    STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            if (!doctor.is_doctor_profile_complete) {
                const isCompleted = await this.completeProfileIfComplete(doctor_id);
                if (isCompleted) {
                    return isCompleted;
                }
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in DoctorService.updateDoctor: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Updates a doctor's status.
     * @param {Object} params - parameters for updating doctor status
     * @param {number} params.person_id - The ID of the person making the request.
     * @param {number} params.doctor_id - The ID of the doctor to update.
     * @param {string} params.status - The new status for the doctor.
     * @returns {Promise<Object>} - The updated doctor object.
     * @throws {AppError} - If any issue occurs.
     */
    static async updateDoctorStatus({person_id, doctor_id, status}) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }
            
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!status) {
                throw new AppError("status is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof status !== 'string') {
                throw new AppError("status must be a string", STATUS_CODES.BAD_REQUEST);
            }

            if (!VALID_DOCTOR_STATUSES.includes(status)) {
                throw new AppError(`Invalid status`, STATUS_CODES.BAD_REQUEST);
            }

            const checkStaffExists =
                await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!checkStaffExists) {
                throw new AppError(
                    "You are not authorized to update doctor status",
                    STATUS_CODES.FORBIDDEN
                );
            }
            const doctor = await this.getDoctorIfExists(doctor_id);
            if (!doctor) {
                throw new AppError("Doctor not found", STATUS_CODES.NOT_FOUND);
            }
            if (doctor.hospital_id !== checkStaffExists.hospital_id) {
                throw new AppError(
                    "You are not authorized to update doctor status for this hospital",
                    STATUS_CODES.FORBIDDEN
                );
            }

            const query = {
                text: `UPDATE doctor
                SET status = $1
                WHERE
                doctor_id = $2
                RETURNING *`,
                values: [status, doctor_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(
                    `Error updating doctor status`,
                    STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in DoctorService.updateDoctorStatus: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Updates a doctor's hospital association by the doctor themselves.
     * @param {number} doctor_id - The ID of the doctor to update.
     * @param {number|null} hospital_id - The new hospital ID to associate with (null to remove association).
     * @returns {Promise<Object>} - The updated doctor object.
     * @throws {AppError} - If any issue occurs.
     */
    static async updateDoctorHospitalAssociationForDoctor(doctor_id, hospital_id = null) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const doctor = await this.getDoctorIfExists(doctor_id);
            if (!doctor) {
                throw new AppError("Doctor not found", STATUS_CODES.NOT_FOUND);
            }

            if (hospital_id === null) {
                if (!doctor.hospital_id) {
                    throw new AppError("Doctor is not associated with any hospital", STATUS_CODES.BAD_REQUEST);
                }

                const futureAppointmentsCount = await this.getFutureHospitalAppointmentsCount(doctor_id, doctor.hospital_id);
                if (futureAppointmentsCount > 0) {
                    throw new AppError(
                        "Cannot remove hospital association while future appointments exist. Contact hospital administration to remove with reassignment.",
                        STATUS_CODES.BAD_REQUEST
                    );
                }
            }

            if (hospital_id !== null) {
                const hospital = await HospitalService.getHospitalIfExists(hospital_id);
                if (!hospital) {
                    throw new AppError("hospital does not exist", STATUS_CODES.BAD_REQUEST);
                }
            }

            const query = {
                text: `UPDATE doctor
                SET
                hospital_id = $1
                WHERE
                doctor_id = $2
                RETURNING *`,
                values: [hospital_id, doctor_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(
                    `Error updating doctor hospital`,
                    STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in DoctorService.updateDoctorHospitalAssociationForDoctor: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Updates a doctor's hospital association to null (removal) by hospital staff.
     * @param {number} person_id - The ID of the person making the request.
     * @param {number} doctor_id - The ID of the doctor to update.
     * @returns {Promise<Object>} - The updated doctor object.
     * @throws {AppError} - If any issue occurs.
     */
    static async updateDoctorHospitalAssociationForHospital(person_id, doctor_id, reassignmentOptions = {}) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const doctor = await this.getDoctorIfExists(doctor_id);
            if (!doctor) {
                throw new AppError("doctor does not exist", STATUS_CODES.BAD_REQUEST)
            }

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError("You are not authorized to update hospital association", STATUS_CODES.FORBIDDEN);
            }

            if (hospitalStaff.hospital_id !== doctor.hospital_id) {
                throw new AppError("You are not authorized to update hospital association for this doctor", STATUS_CODES.FORBIDDEN);
            }

            const futureAppointmentsCount = await this.getFutureHospitalAppointmentsCount(doctor_id, doctor.hospital_id);

            const { reassignment_mode = null, reassigned_doctor_id = null } = reassignmentOptions;
            let targetDoctorId = null;
            if (futureAppointmentsCount > 0) {
                if (!reassignment_mode) {
                    throw new AppError(
                        "Doctor has future appointments. Choose reassignment_mode: manual or automatic",
                        STATUS_CODES.BAD_REQUEST
                    );
                }

                if (reassignment_mode === "manual") {
                    if (!reassigned_doctor_id) {
                        throw new AppError("reassigned_doctor_id is required for manual reassignment", STATUS_CODES.BAD_REQUEST);
                    }

                    const targetDoctor = await this.getDoctorIfExists(reassigned_doctor_id);
                    if (!targetDoctor) {
                        throw new AppError("Reassigned doctor not found", STATUS_CODES.NOT_FOUND);
                    }

                    if (targetDoctor.doctor_id === doctor_id) {
                        throw new AppError("Cannot reassign appointments to the same doctor", STATUS_CODES.BAD_REQUEST);
                    }

                    if (targetDoctor.hospital_id !== doctor.hospital_id) {
                        throw new AppError("Reassigned doctor must belong to the same hospital", STATUS_CODES.BAD_REQUEST);
                    }

                    if (targetDoctor.doctor_status !== VALID_DOCTOR_STATUSES_OBJECT.ACTIVE) {
                        throw new AppError("Reassigned doctor must be active", STATUS_CODES.BAD_REQUEST);
                    }

                    targetDoctorId = targetDoctor.doctor_id;
                } else if (reassignment_mode === "automatic") {
                    const autoAssignQuery = {
                        text: `SELECT d.doctor_id,
                        COUNT(a.appointment_id) AS active_appointments
                        FROM doctor_view d
                        LEFT JOIN appointment a
                            ON a.doctor_id = d.doctor_id
                            AND a.hospital_id = $1
                            AND a.status IN ('${VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING}', '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}')
                            AND a.date >= CURRENT_DATE
                        WHERE d.hospital_id = $1
                        AND d.doctor_status = '${VALID_DOCTOR_STATUSES_OBJECT.ACTIVE}'
                        AND d.doctor_id != $2
                        GROUP BY d.doctor_id
                        ORDER BY active_appointments ASC, d.doctor_id ASC
                        LIMIT 1`,
                        values: [doctor.hospital_id, doctor_id],
                    };
                    const autoAssignResult = await DatabaseService.query(autoAssignQuery.text, autoAssignQuery.values);
                    if (autoAssignResult.rowCount === 0) {
                        throw new AppError("No eligible doctor available for automatic reassignment", STATUS_CODES.BAD_REQUEST);
                    }

                    targetDoctorId = autoAssignResult.rows[0].doctor_id;
                } else {
                    throw new AppError("Invalid reassignment_mode. Use manual or automatic", STATUS_CODES.BAD_REQUEST);
                }
            }

            const txQueries = [];
            if (futureAppointmentsCount > 0 && targetDoctorId) {
                txQueries.push({
                    text: `UPDATE appointment
                    SET doctor_id = $1
                    WHERE doctor_id = $2
                    AND hospital_id = $3
                    AND status IN ('${VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING}', '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}')
                    AND date >= CURRENT_DATE`,
                    params: [targetDoctorId, doctor_id, doctor.hospital_id],
                });
            }

            txQueries.push({
                text: `UPDATE doctor
                SET
                hospital_id = $1
                WHERE
                doctor_id = $2
                RETURNING *`,
                params: [null, doctor_id],
            });

            const txResults = await DatabaseService.transaction(txQueries);
            const result = txResults[txResults.length - 1];
            if (result.rowCount === 0) {
                throw new AppError(
                    `Error updating doctor hospital`,
                    STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            if (futureAppointmentsCount > 0 && targetDoctorId) {
                const reassignedCount = txResults[0]?.rowCount || 0;
                try {
                    await LogService.insertLog(
                        person_id,
                        `Reassigned ${reassignedCount} future appointments from doctor ${doctor_id} to doctor ${targetDoctorId} (${reassignment_mode})`
                    );
                } catch (logError) {
                    console.error(`Doctor reassignment log failed: ${logError.message}`);
                }
            }

            try {
                await LogService.insertLog(person_id, `Removed doctor ${doctor_id} from hospital ${doctor.hospital_id}`);
            } catch (logError) {
                console.error(`Doctor removal log failed: ${logError.message}`);
            }

            try {
                await NotificationService.insertNotification({
                    person_id: doctor_id,
                    role: VALID_ROLES_OBJECT.DOCTOR,
                    title: "Hospital Association Updated",
                    message: "Your hospital association has been removed by hospital administration.",
                    type: "system",
                    related_id: doctor_id,
                    related_table: VALID_TABLES_OBJECT.DOCTOR,
                    sendEmail: false,
                });
            } catch (notificationError) {
                console.error(`Doctor removal notification failed: ${notificationError.message}`);
            }

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in DoctorService.updateDoctorHospitalAssociationForHospital: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Marks doctor profile as complete if all fields are filled.
     * @param {number} doctor_id - The ID of the doctor to check and update.
     * @returns {Promise<Object>} - The updated doctor object with profile marked as complete.
     * @throws {AppError} if any issue occurs
     */
    static async completeProfileIfComplete(doctor_id) {
        try {
            if (!doctor_id) {
                throw new AppError('doctor_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const doctor = await this.getDoctorIfExists(doctor_id);
            if (!doctor) {
                throw new AppError('Doctor does not exist', STATUS_CODES.NOT_FOUND);
            }

            for (const [key, value] of Object.entries(doctor)) {
                if (value === null && key !== 'hospital_id' && key !== 'hospital_name') {
                    return false;
                }
            }

            const query = {
                text: `UPDATE doctor
                SET is_profile_complete = TRUE
                WHERE doctor_id = $1
                RETURNING *`,
                values: [doctor_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Error completing profile', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in DoctorService.completeProfileIfComplete: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { DoctorService };