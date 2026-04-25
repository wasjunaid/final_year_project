const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");
const {
    validateIDFieldsForPrescription,
    validateFieldsForGetPrescriptionsAgainstAppointment,
    validateFieldsForInsertPrescription
} = require("../../validations/prescription/prescriptionValidations");
const { AppointmentDetailService } = require("../Appointment/AppointmentDetailService");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { MedicineService } = require("../Medicine/MedicineService");
const { DoctorService } = require("../Doctor/DoctorService");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

class PrescriptionService {
    /**
     * Retrieves current prescriptions for a given patient.
     * @param {number} patient_id - The ID of the patient.
     * @returns {Promise<Array|boolean>} Array of prescription objects or false if none found.
     * @throws {AppError} if any issue occurs
     */
    static async getCurrentPrescriptionsForPatient(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            ({ patient_id } = validateIDFieldsForPrescription({ patient_id }));

            const query = {
                text: `SELECT * FROM prescription_view
                WHERE
                patient_id = $1 AND
                current = TRUE`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in PrescriptionService.getCurrentPrescriptionsForPatient: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Retrieves current prescriptions for a given patient (for doctor view).
     * @param {number} patient_id - The ID of the patient.
     * @returns {Promise<Array|boolean>} Array of prescription objects or false if none found.
     * @throws {AppError} if any issue occurs
     */
    static async getCurrentPrescriptionsForDoctor(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            ({ patient_id } = validateIDFieldsForPrescription({ patient_id }));

            const query = {
                text: `SELECT * FROM prescription_view
                WHERE
                patient_id = $1 AND
                current = TRUE`,
                values: [patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in PrescriptionService.getCurrentPrescriptionsForDoctor: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Retrieves prescriptions for a given appointment if it exists and belongs to the patient.
     * @param {number} patient_id - The ID of the patient.
     * @param {number} appointment_id - The ID of the appointment.
     * @returns {Promise<Array|boolean>} Array of prescription objects or false if none found.
     * @throws {AppError} if any issue occurs
     */
    static async getPrescriptionsAgainstAppointmentIfExists(patient_id, appointment_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError('appointment_id is required', STATUS_CODES.BAD_REQUEST);
            }

            ({ patient_id, appointment_id } = validateIDFieldsForPrescription({ patient_id, appointment_id }));

            const appointment = await AppointmentDetailService.getAppointmentDetailsIfExists(appointment_id);
            if (!appointment) {
                throw new AppError('Appointment not found', STATUS_CODES.NOT_FOUND);
            }

            validateFieldsForGetPrescriptionsAgainstAppointment({ patient_id, appointment });

            const query = {
                text: `SELECT * FROM prescription_view
                WHERE
                appointment_id = $1`,
                values: [appointment_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in PrescriptionService.getPrescriptionsAgainstAppointmentIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new prescription into the database.
     * @param {object} params - The prescription details.
     * @param {number} params.person_id - The ID of the hospital staff creating the prescription.
     * @param {number} params.appointment_id - The ID of the appointment.
     * @param {number} params.medicine_id - The ID of the medicine.
     * @param {string} params.dosage - The dosage instructions.
     * @param {string} params.instruction - Additional instructions.
     * @returns {Promise<object>} The inserted prescription object.
     * @throws {AppError} if any issue occurs
     */
    static async insertPrescription({person_id, role, appointment_id, medicine_id, dosage, instruction, prescription_date}) {
        try {
            if (!person_id) {
                throw new AppError('person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError('appointment_id is required', STATUS_CODES.BAD_REQUEST);
            }

            if (!medicine_id) {
                throw new AppError('medicine_id is required', STATUS_CODES.BAD_REQUEST);
            }

            let hospitalStaff;
            if (role !== roles.DOCTOR) {
                hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
                if (!hospitalStaff) {
                    throw new AppError('Hospital staff not found', STATUS_CODES.NOT_FOUND);
                }
            } else {
                hospitalStaff = await DoctorService.getDoctorIfExists(person_id);
                if (!hospitalStaff) {
                    throw new AppError('Doctor not found', STATUS_CODES.NOT_FOUND);
                }
            }

            const appointment = await AppointmentDetailService.getAppointmentDetailsIfExists(appointment_id);
            if (!appointment) {
                throw new AppError('Appointment not found', STATUS_CODES.NOT_FOUND);
            }

            const medicine = await MedicineService.getMedicineIfExists(medicine_id);
            if (!medicine) {
                throw new AppError('Medicine not found', STATUS_CODES.NOT_FOUND);
            }

            ({ dosage, instruction } = validateFieldsForInsertPrescription({ hospitalStaff, appointment, dosage, instruction, prescription_date }));

            const query = {
                text: `INSERT INTO prescription
                (appointment_id, medicine_id, dosage, instruction, prescription_date)
                VALUES
                ($1, $2, $3, $4, $5)
                RETURNING *`,
                values: [appointment_id, medicine_id, dosage, instruction, prescription_date]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Error inserting prescription', STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PrescriptionService.insertPrescription: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError('Prescription already exists', STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }

    /**
     * Marks a prescription as not current.
     * @param {number} prescription_id - The ID of the prescription to update.
     * @returns {Promise<object>} The updated prescription object.
     * @throws {AppError} if any issue occurs
     */
    static async removeFromCurrentPrescriptions(prescription_id) {
        try {
            if (!prescription_id) {
                throw new AppError('prescription_id is required', STATUS_CODES.BAD_REQUEST);
            }

            ({ prescription_id } = validateIDFieldsForPrescription({ prescription_id }));
            
            const query = {
                text: `UPDATE prescription
                SET current = FALSE
                WHERE prescription_id = $1
                RETURNING *`,
                values: [prescription_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError('Prescription not found', STATUS_CODES.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in PrescriptionService.removeFromCurrentPrescriptions: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PrescriptionService };