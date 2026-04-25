const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { validateID } = require("../../utils/idUtil");
const {
    APPOINTMENT_CONFIG,
    VALID_APPOINTMENT_STATUSES_OBJECT,
    validateIDFieldsForAppointment,
    validateFieldsForInsertAppointment,
    validateFieldsForApproveAppointment,
    validateFieldsForDenyAppointment,
    validateFieldsForCancelAppointment,
    validateFieldsForRescheduleAppointmentForPatient,
    validateFieldsForRescheduleAppointmentForHospitalStaff,
    validateFieldsForStartAppointment,
    validateFieldsForOrderLabTests,
    validateFieldsForCompleteAppointment,
    validateFieldsForCompleteLabTests,
    validateFieldsForHospitalizeAppointment,
    validateFieldsForDischargeAppointment,
} = require("../../validations/appointment/appointmentValidations");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const { DoctorService } = require("../Doctor/DoctorService");
const { HospitalService } = require("../Hospital/HospitalService");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { PatientMedicalHistoryService } = require("../Patient/PatientMedicalHistoryService");
const { BillService } = require("../Bill/BillService");
const { AI_MEDICAL_CODING_API_BASE_URL, AI_MEDICAL_CODING_GENERATE_CODES_ENDPOINT } = require("../../config/aiMedicalCodingConfig");
const { AppointmentICDService } = require("../MedicalCoding/AppointmentICDService");
const { AppointmentCPTService } = require("../MedicalCoding/AppointmentCPTService");
const { PatientAllergyService } = require("../Patient/PatientAllergyService");
const { PatientFamilyHistoryService } = require("../Patient/PatientFamilyHistoryService");
const { PatientSurgicalHistoryService } = require("../Patient/PatientSurgicalHistoryService");
const { PatientService } = require("../Patient/PatientService");
const axios = require("axios");
const { PrescriptionService } = require("../Prescription/PrescriptionService");
const { AppointmentDocumentsService } = require("../Document/AppointmentDocumentsService");
const { EHRAccessService } = require("../EHR/EHRAccessService");
const { NotificationService } = require("../Notification/NotificationService");
const { LogService } = require("../Log/LogService");
const { VALID_TABLES_OBJECT } = require("../../utils/validConstantsUtil");

class AppointmentService {
    static async validateDoctorScopedAppointmentAction(doctor_id, appointment) {
        if (!doctor_id) {
            throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
        }

        if (!appointment) {
            throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
        }

        const doctor = await DoctorService.getDoctorIfExists(doctor_id);
        if (!doctor) {
            throw new AppError("Doctor not found", STATUS_CODES.NOT_FOUND);
        }

        if (!doctor.hospital_id) {
            throw new AppError("Doctor is not currently associated with a hospital", STATUS_CODES.FORBIDDEN);
        }

        if (Number(appointment.hospital_id) !== Number(doctor.hospital_id)) {
            throw new AppError("You do not have permission to access appointments outside your hospital", STATUS_CODES.FORBIDDEN);
        }

        if (Number(appointment.doctor_id) !== Number(doctor_id)) {
            throw new AppError("You do not have permission to access this appointment", STATUS_CODES.FORBIDDEN);
        }

        return doctor;
    }

    static truncateForCoding(value, maxLength = 400) {
        if (value === null || value === undefined) {
            return "";
        }

        const normalized = String(value).replace(/\s+/g, " ").trim();
        if (normalized.length <= maxLength) {
            return normalized;
        }

        return `${normalized.slice(0, maxLength)}...`;
    }

    static buildProviderNotesForMedicalCoding({
        history_of_present_illness,
        review_of_systems,
        physical_exam,
        diagnosis,
        plan,
        prescriptions = [],
        verifiedDocs = [],
        unverifiedDocs = [],
    }) {
        const sections = [];

        sections.push(`History of Present Illness: ${this.truncateForCoding(history_of_present_illness)}`);
        sections.push(`Review of Systems: ${this.truncateForCoding(review_of_systems)}`);
        sections.push(`Physical Exam: ${this.truncateForCoding(physical_exam)}`);
        sections.push(`Diagnosis: ${this.truncateForCoding(diagnosis)}`);
        sections.push(`Plan: ${this.truncateForCoding(plan)}`);

        if (prescriptions.length > 0) {
            const prescriptionLines = prescriptions.slice(0, 20).map((prescription) => {
                const medicineName = this.truncateForCoding(prescription.medicine_name, 120);
                const dosage = this.truncateForCoding(prescription.dosage, 120);
                const instruction = this.truncateForCoding(prescription.instruction, 240);
                return `- ${medicineName}; Dosage: ${dosage}; Instruction: ${instruction}`;
            });
            sections.push(`Prescriptions for this appointment:\n${prescriptionLines.join("\n")}`);
        }

        if (verifiedDocs.length > 0) {
            const verifiedDocLines = verifiedDocs.slice(0, 20).map((doc) => {
                const labTestName = this.truncateForCoding(doc.lab_test_name, 140);
                const detail = this.truncateForCoding(doc.detail, 260);
                return `- Lab test: ${labTestName}; Detail: ${detail}`;
            });
            sections.push(`Verified lab documents:\n${verifiedDocLines.join("\n")}`);
        }

        if (unverifiedDocs.length > 0) {
            const unverifiedDocLines = unverifiedDocs.slice(0, 20).map((doc) => {
                const labTestName = this.truncateForCoding(doc.lab_test_name, 140);
                const detail = this.truncateForCoding(doc.detail, 260);
                return `- Lab test: ${labTestName}; Detail: ${detail}`;
            });
            sections.push(`Unverified external lab documents:\n${unverifiedDocLines.join("\n")}`);
        }

        return sections.join("\n\n");
    }

    static async recordAppointmentEvent({ actor_person_id, logAction, notifications = [] }) {
        if (actor_person_id && logAction) {
            try {
                await LogService.insertLog(actor_person_id, logAction);
            } catch (logError) {
                console.error(`Appointment event log failed: ${logError.message}`);
            }
        }

        for (const payload of notifications) {
            try {
                await NotificationService.insertNotification({
                    ...payload,
                    related_table: payload.related_table || VALID_TABLES_OBJECT.APPOINTMENT,
                    sendEmail: payload.sendEmail ?? false,
                });
            } catch (notificationError) {
                console.error(`Appointment notification failed: ${notificationError.message}`);
            }
        }
    }

   
    /**
     * Retrieves an appointment by its ID if it exists.
     * @param {number|string} appointment_id - The ID of the appointment to retrieve.
     * @returns {Promise<Object|boolean>} - The appointment object if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAppointmentIfExists(appointment_id) {
        try {
            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            appointment_id = validateID(appointment_id);

            const query = {
                text: `SELECT * FROM appointment_view
                WHERE
                appointment_id = $1`,
                values: [appointment_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.getAppointmentIfExists: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Retrieves an appointment by its ID if it exists.
     * @param {number|string} appointment_id - The ID of the appointment to retrieve.
     * @returns {Promise<Object|boolean>} - The appointment object if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAppointmentIfExistsForFrontend(appointment_id) {
        try {
            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            appointment_id = validateID(appointment_id);

            const query = {
                text: `SELECT 
                a.*,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                CONCAT('Dr. ', doc.first_name, ' ', doc.last_name) as doctor_name,
                h.name as hospital_name
            FROM appointment a
            LEFT JOIN patient pat ON a.patient_id = pat.patient_id
            LEFT JOIN person p ON pat.patient_id = p.person_id
            LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
            LEFT JOIN person doc ON d.doctor_id = doc.person_id
            LEFT JOIN hospital h ON a.hospital_id = h.hospital_id
            WHERE
                a.appointment_id = $1`,
                values: [appointment_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.getAppointmentIfExists: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Retrieves all appointments for a specific patient if they exist.
     * @param {number|string} patient_id - The ID of the patient whose appointments to retrieve.
     * @returns {Promise<Array|boolean>} - An array of appointment objects if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAppointmentsForPatientIfExists(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            patient_id = validateID(patient_id);

            const query = {
                text: `SELECT * FROM appointment_view
                WHERE
                patient_id = $1 ORDER BY
                date ASC, time ASC`,
                values: [patient_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(
                `Error in AppointmentService.getAppointmentsForPatientIfExists: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Retrieves all appointments for a specific patient if they exist.
     * @param {number|string} patient_id - The ID of the patient whose appointments to retrieve.
     * @returns {Promise<Array|boolean>} - An array of appointment objects if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAppointmentsForPatientIfExistsForFrontend(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            patient_id = validateID(patient_id);

            const query = {
                text: `SELECT 
                a.*,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                CONCAT('Dr. ', doc.first_name, ' ', doc.last_name) as doctor_name,
                h.name as hospital_name
            FROM appointment a
            LEFT JOIN patient pat ON a.patient_id = pat.patient_id
            LEFT JOIN person p ON pat.patient_id = p.person_id
            LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
            LEFT JOIN person doc ON d.doctor_id = doc.person_id
            LEFT JOIN hospital h ON a.hospital_id = h.hospital_id
            WHERE
                a.patient_id = $1
            ORDER BY
                a.date ASC, a.time ASC`,
                values: [patient_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(
                `Error in AppointmentService.getAppointmentsForPatientIfExists: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Retrieves all appointments for a specific doctor if they exist.
     * @param {number|string} doctor_id - The ID of the doctor whose appointments to retrieve.
     * @returns {Promise<Array|boolean>} - An array of appointment objects if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAppointmentsForDoctorIfExists(doctor_id) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            doctor_id = validateID(doctor_id);

            const doctor = await DoctorService.getDoctorIfExists(doctor_id);
            if (!doctor) {
                throw new AppError("Doctor not found", STATUS_CODES.NOT_FOUND);
            }

            if (!doctor.hospital_id) {
                return false;
            }

            const query = {
                text: `SELECT * FROM appointment_view
                WHERE
                doctor_id = $1 AND
                hospital_id = $2 AND
                (status = '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}' OR status = '${VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS}' OR status = '${VALID_APPOINTMENT_STATUSES_OBJECT.COMPLETED}')
                ORDER BY
                date ASC, time ASC`,
                values: [doctor_id, doctor.hospital_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(
                `Error in AppointmentService.getAppointmentsForDoctorIfExists: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Retrieves all appointments for a specific doctor if they exist.
     * @param {number|string} doctor_id - The ID of the doctor whose appointments to retrieve.
     * @returns {Promise<Array|boolean>} - An array of appointment objects if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAppointmentsForDoctorIfExistsForFrontend(doctor_id) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            doctor_id = validateID(doctor_id);

            const doctor = await DoctorService.getDoctorIfExists(doctor_id);
            if (!doctor) {
                throw new AppError("Doctor not found", STATUS_CODES.NOT_FOUND);
            }

            if (!doctor.hospital_id) {
                return false;
            }

            const query = {
                text: `SELECT 
                a.*,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                CONCAT('Dr. ', doc.first_name, ' ', doc.last_name) as doctor_name,
                h.name as hospital_name
            FROM appointment a
            LEFT JOIN patient pat ON a.patient_id = pat.patient_id
            LEFT JOIN person p ON pat.patient_id = p.person_id
            LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
            LEFT JOIN person doc ON d.doctor_id = doc.person_id
            LEFT JOIN hospital h ON a.hospital_id = h.hospital_id
            WHERE
                a.doctor_id = $1 AND
                a.hospital_id = $2 AND
                (a.status = '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}' 
                OR a.status = '${VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS}' 
                OR a.status = '${VALID_APPOINTMENT_STATUSES_OBJECT.COMPLETED}')
            ORDER BY
                a.date ASC, a.time ASC`,
                values: [doctor_id, doctor.hospital_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(
                `Error in AppointmentService.getAppointmentsForDoctorIfExists: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Retrieves all appointments for hospital staff if they exist.
     * Hospital staff can only see appointments for their hospital.
     * @param {number|string} person_id - The ID of the hospital staff member.
     * @returns {Promise<Array|boolean>} - An array of appointment objects if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAppointmentsForHospitalStaffIfExists(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            person_id = validateID(person_id);

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError(
                    "You are not a staff member of any hospital",
                    STATUS_CODES.FORBIDDEN
                );
            }
            let queryAppend = "";
            if (hospitalStaff.role === VALID_ROLES_OBJECT.HOSPITAL_LAB_TECHNICIAN) {
                queryAppend = `AND lab_test_required = TRUE`;
            } else if (hospitalStaff.role === VALID_ROLES_OBJECT.HOSPITAL_PHARMACIST) {
                queryAppend = `AND prescription_required = TRUE`;
            }

            const query = {
                text: `SELECT * FROM appointment_view
                WHERE
                hospital_id = $1 ${queryAppend}
                ORDER BY
                date ASC, time ASC`,
                values: [hospitalStaff.hospital_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(
                `Error in AppointmentService.getAppointmentsForHospitalStaffIfExists: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Retrieves all appointments for hospital staff if they exist.
     * Hospital staff can only see appointments for their hospital.
     * @param {number|string} person_id - The ID of the hospital staff member.
     * @returns {Promise<Array|boolean>} - An array of appointment objects if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getAppointmentsForHospitalStaffIfExistsForFrontend(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            person_id = validateID(person_id);

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError(
                    "You are not a staff member of any hospital",
                    STATUS_CODES.FORBIDDEN
                );
            }

            const query = {
                text: `SELECT 
                a.*,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                CONCAT('Dr. ', doc.first_name, ' ', doc.last_name) as doctor_name,
                h.name as hospital_name
            FROM appointment a
            LEFT JOIN patient pat ON a.patient_id = pat.patient_id
            LEFT JOIN person p ON pat.patient_id = p.person_id
            LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
            LEFT JOIN person doc ON d.doctor_id = doc.person_id
            LEFT JOIN hospital h ON a.hospital_id = h.hospital_id
            WHERE
                a.hospital_id = $1
            ORDER BY
                a.date ASC, a.time ASC`,
                values: [hospitalStaff.hospital_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(
                `Error in AppointmentService.getAppointmentsForHospitalStaffIfExists: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Inserts a new appointment into the database.
     * @param {Object} appointmentData - The appointment data.
     * @param {number} appointmentData.patient_id - The ID of the patient.
     * @param {number} appointmentData.doctor_id - The ID of the doctor.
     * @param {number} appointmentData.hospital_id - The ID of the hospital.
     * @param {string} appointmentData.date - The date of the appointment (YYYY-MM-DD).
     * @param {string} appointmentData.time - The time of the appointment (HH:MM).
     * @param {string} appointmentData.reason - The reason for the appointment.
     * @returns {Promise<Object>} - The inserted appointment object.
     * @throws {AppError} if any issue occurs
     */
    static async insertAppointment({
        patient_id,
        doctor_id,
        hospital_id,
        date,
        time,
        reason,
        appointment_type = "opd",
        parent_appointment_id = null,
        follow_up_notes = null,
        admission_date = null,
        discharge_date = null,
    }) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!date) {
                throw new AppError("date is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!time) {
                throw new AppError("time is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!reason) {
                throw new AppError("reason is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof appointment_type !== "string") {
                throw new AppError("appointment_type must be a string", STATUS_CODES.BAD_REQUEST);
            }

            appointment_type = appointment_type.trim().toLowerCase();
            if (!["opd", "hospitalization"].includes(appointment_type)) {
                throw new AppError("appointment_type must be opd or hospitalization", STATUS_CODES.BAD_REQUEST);
            }

            if (parent_appointment_id !== null && parent_appointment_id !== undefined) {
                parent_appointment_id = validateID(parent_appointment_id);
                const parentAppointment = await this.getAppointmentIfExists(parent_appointment_id);
                if (!parentAppointment) {
                    throw new AppError("parent appointment does not exist", STATUS_CODES.BAD_REQUEST);
                }
            } else {
                parent_appointment_id = null;
            }

            if (follow_up_notes !== null && follow_up_notes !== undefined) {
                if (typeof follow_up_notes !== "string") {
                    throw new AppError("follow_up_notes must be a string", STATUS_CODES.BAD_REQUEST);
                }
                follow_up_notes = follow_up_notes.trim();
                if (follow_up_notes.length === 0) {
                    follow_up_notes = null;
                }
            } else {
                follow_up_notes = null;
            }

            if (admission_date) {
                const parsedAdmissionDate = new Date(admission_date);
                if (Number.isNaN(parsedAdmissionDate.getTime())) {
                    throw new AppError("admission_date must be a valid date", STATUS_CODES.BAD_REQUEST);
                }
            }

            if (discharge_date) {
                const parsedDischargeDate = new Date(discharge_date);
                if (Number.isNaN(parsedDischargeDate.getTime())) {
                    throw new AppError("discharge_date must be a valid date", STATUS_CODES.BAD_REQUEST);
                }
            }

            if (admission_date && discharge_date) {
                const parsedAdmissionDate = new Date(admission_date);
                const parsedDischargeDate = new Date(discharge_date);
                if (parsedDischargeDate < parsedAdmissionDate) {
                    throw new AppError("discharge_date cannot be before admission_date", STATUS_CODES.BAD_REQUEST);
                }
            }

            ({ patient_id, doctor_id, hospital_id } = validateIDFieldsForAppointment({ patient_id, doctor_id, hospital_id }));

            const doctor = await DoctorService.getDoctorIfExists(doctor_id);
            if (!doctor) {
                throw new AppError("Doctor does not exist", STATUS_CODES.BAD_REQUEST);
            }

            const hospital = await HospitalService.getHospitalIfExists(hospital_id);
            if (!hospital) {
                throw new AppError("Hospital does not exist", STATUS_CODES.BAD_REQUEST);
            }

            ({ date, time, reason } = validateFieldsForInsertAppointment({ doctor, hospital, date, time, reason }));

            const clash = await this.checkAppointmentClashIfExists({doctor_id, date, time});
            if (clash) {
                throw new AppError("Doctor already has an appointment at this date and time", STATUS_CODES.CONFLICT);
            }

            const query = {
                text: `INSERT INTO appointment
                (patient_id, doctor_id, hospital_id, date, time, reason, appointment_type, parent_appointment_id, follow_up_notes, admission_date, discharge_date)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *`,
                values: [
                    patient_id,
                    doctor_id,
                    hospital_id,
                    date,
                    time,
                    reason,
                    appointment_type,
                    parent_appointment_id,
                    follow_up_notes,
                    admission_date,
                    discharge_date,
                ],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(
                    "Failed to insert appointment",
                    STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            await this.recordAppointmentEvent({
                actor_person_id: patient_id,
                logAction: `Appointment ${result.rows[0].appointment_id} requested by patient ${patient_id} with doctor ${doctor_id} at hospital ${hospital_id} on ${date} ${time}`,
                notifications: [
                    {
                        person_id: patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Appointment Request Submitted",
                        message: `Your appointment request #${result.rows[0].appointment_id} has been submitted and is pending hospital approval.`,
                        type: "system",
                        related_id: result.rows[0].appointment_id,
                    },
                    {
                        person_id: doctor_id,
                        role: VALID_ROLES_OBJECT.DOCTOR,
                        title: "New Appointment Request",
                        message: `A new appointment request #${result.rows[0].appointment_id} is awaiting scheduling.`,
                        type: "system",
                        related_id: result.rows[0].appointment_id,
                    },
                ],
            });

            try {
                await EHRAccessService.requestEHRAccess(doctor_id, patient_id);
            } catch (ehrAccessError) {
                console.error(`Automatic EHR access request failed for appointment ${result.rows[0].appointment_id}: ${ehrAccessError.message}`);
            }

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.insertAppointment: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Creates a follow-up appointment for a doctor from an existing parent appointment.
     * The new appointment is always linked to the same patient and hospital as the parent.
     * @param {Object} params
     * @param {number|string} params.doctor_id
     * @param {number|string} params.parent_appointment_id
     * @param {string} params.date
     * @param {string} params.time
     * @param {string} params.reason
     * @param {string} [params.appointment_type]
     * @param {string} [params.follow_up_notes]
     * @param {string} [params.admission_date]
     * @param {string} [params.discharge_date]
     * @returns {Promise<Object>}
     */
    static async createFollowUpAppointmentForDoctor({
        doctor_id,
        parent_appointment_id,
        date,
        time,
        reason,
        appointment_type = "opd",
        follow_up_notes = null,
        admission_date = null,
        discharge_date = null,
    }) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!parent_appointment_id) {
                throw new AppError("parent_appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!date) {
                throw new AppError("date is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!time) {
                throw new AppError("time is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!reason) {
                throw new AppError("reason is required", STATUS_CODES.BAD_REQUEST);
            }

            doctor_id = validateID(doctor_id);
            parent_appointment_id = validateID(parent_appointment_id);

            const parentAppointment = await this.getAppointmentIfExists(parent_appointment_id);
            if (!parentAppointment) {
                throw new AppError("Parent appointment not found", STATUS_CODES.NOT_FOUND);
            }

            await this.validateDoctorScopedAppointmentAction(doctor_id, parentAppointment);

            if (![VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS, VALID_APPOINTMENT_STATUSES_OBJECT.COMPLETED].includes(parentAppointment.status)) {
                throw new AppError("Follow-up can only be created from in-progress or completed appointments", STATUS_CODES.BAD_REQUEST);
            }

            if (!parentAppointment.hospital_id) {
                throw new AppError("Parent appointment does not have a hospital", STATUS_CODES.BAD_REQUEST);
            }

            if (!parentAppointment.patient_id) {
                throw new AppError("Parent appointment does not have a patient", STATUS_CODES.BAD_REQUEST);
            }

            const appointment = await this.insertAppointment({
                patient_id: parentAppointment.patient_id,
                doctor_id,
                hospital_id: parentAppointment.hospital_id,
                date,
                time,
                reason,
                appointment_type,
                parent_appointment_id,
                follow_up_notes,
                admission_date,
                discharge_date,
            });

            return appointment;
        } catch (error) {
            console.error(
                `Error in AppointmentService.createFollowUpAppointmentForDoctor: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Creates a follow-up appointment for a patient from a completed parent appointment.
     * The new appointment keeps the same doctor and hospital as the parent.
     * @param {Object} params
     * @param {number|string} params.patient_id
     * @param {number|string} params.parent_appointment_id
     * @param {string} params.date
     * @param {string} params.time
     * @param {string} params.reason
     * @param {string} [params.appointment_type]
     * @param {string} [params.follow_up_notes]
     * @param {string} [params.admission_date]
     * @param {string} [params.discharge_date]
     * @returns {Promise<Object>}
     */
    static async createFollowUpAppointmentForPatient({
        patient_id,
        parent_appointment_id,
        date,
        time,
        reason,
        appointment_type = "opd",
        follow_up_notes = null,
        admission_date = null,
        discharge_date = null,
    }) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!parent_appointment_id) {
                throw new AppError("parent_appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!date) {
                throw new AppError("date is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!time) {
                throw new AppError("time is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!reason) {
                throw new AppError("reason is required", STATUS_CODES.BAD_REQUEST);
            }

            patient_id = validateID(patient_id);
            parent_appointment_id = validateID(parent_appointment_id);

            const parentAppointment = await this.getAppointmentIfExists(parent_appointment_id);
            if (!parentAppointment) {
                throw new AppError("Parent appointment not found", STATUS_CODES.NOT_FOUND);
            }

            if (Number(parentAppointment.patient_id) !== Number(patient_id)) {
                throw new AppError("You do not have permission to create follow-up for this appointment", STATUS_CODES.FORBIDDEN);
            }

            if (parentAppointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.COMPLETED) {
                throw new AppError("Follow-up can only be created from completed appointments", STATUS_CODES.BAD_REQUEST);
            }

            if (!parentAppointment.hospital_id) {
                throw new AppError("Parent appointment does not have a hospital", STATUS_CODES.BAD_REQUEST);
            }

            if (!parentAppointment.doctor_id) {
                throw new AppError("Parent appointment does not have a doctor", STATUS_CODES.BAD_REQUEST);
            }

            const appointment = await this.insertAppointment({
                patient_id,
                doctor_id: parentAppointment.doctor_id,
                hospital_id: parentAppointment.hospital_id,
                date,
                time,
                reason,
                appointment_type,
                parent_appointment_id,
                follow_up_notes,
                admission_date,
                discharge_date,
            });

            return appointment;
        } catch (error) {
            console.error(
                `Error in AppointmentService.createFollowUpAppointmentForPatient: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Approves an appointment, assigning a doctor, date, time, and cost.
     * Only hospital staff can approve appointments for their hospital.
     * @param {Object} params - The parameters for approving the appointment.
     * @param {number} params.person_id - The ID of the hospital staff member approving the appointment.
     * @param {number} params.appointment_id - The ID of the appointment to approve.
     * @param {number} params.doctor_id - The ID of the doctor to assign.
     * @param {string} params.date - The date of the appointment (YYYY-MM-DD).
     * @param {string} params.time - The time of the appointment (HH:MM).
     * @param {number} params.appointment_cost - The cost of the appointment.
     * @returns {Promise<Object>} - The approved appointment object.
     * @throws {AppError} if any issue occurs
     */
    static async approveAppointment({person_id, appointment_id, doctor_id, date, time, appointment_cost}) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!date) {
                throw new AppError("date is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!time) {
                throw new AppError("time is required", STATUS_CODES.BAD_REQUEST);
            }

            if (appointment_cost === undefined || appointment_cost === null) {
                throw new AppError("appointment_cost is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ person_id, appointment_id, doctor_id } = validateIDFieldsForAppointment({ person_id, appointment_id, doctor_id }));

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError(
                    "You are not a staff member of any hospital",
                    STATUS_CODES.FORBIDDEN
                );
            }

            const doctor = await DoctorService.getDoctorIfExists(doctor_id);
            if (!doctor) {
                throw new AppError("doctor doesnt exist", STATUS_CODES.BAD_REQUEST);
            }

            ({ date, time } = validateFieldsForApproveAppointment({ appointment, hospitalStaff, doctor, date, time, appointment_cost }));

            const clash = await this.checkAppointmentClashIfExists({doctor_id, date, time});
            if (clash) {
                throw new AppError("Doctor already has an appointment at this date and time", STATUS_CODES.CONFLICT);
            }

            const query = {
                text: `UPDATE appointment
                SET
                doctor_id = $1,
                date = $2,
                time = $3,
                appointment_cost = $4,
                status = '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}'
                WHERE
                appointment_id = $5
                RETURNING *`,
                values: [doctor_id, date, time, appointment_cost, appointment_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("failed to approve appointment", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            await this.recordAppointmentEvent({
                actor_person_id: person_id,
                logAction: `Appointment ${appointment_id} approved by hospital staff ${person_id}: doctor ${doctor_id}, schedule ${date} ${time}, cost ${appointment_cost}, previous_status ${appointment.status}`,
                notifications: [
                    {
                        person_id: appointment.patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Appointment Approved",
                        message: `Your appointment #${appointment_id} has been approved for ${date} at ${time}.`,
                        type: "system",
                        related_id: appointment_id,
                    },
                    {
                        person_id: doctor_id,
                        role: VALID_ROLES_OBJECT.DOCTOR,
                        title: "Appointment Assigned",
                        message: `Appointment #${appointment_id} has been scheduled for ${date} at ${time}.`,
                        type: "system",
                        related_id: appointment_id,
                    },
                ],
            });

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.approveAppointment: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Denies an appointment.
     * Only hospital staff can deny appointments for their hospital.
     * @param {number} person_id - The ID of the hospital staff member denying the appointment.
     * @param {number} appointment_id - The ID of the appointment to deny.
     * @returns {Promise<Object>} - The denied appointment object.
     * @throws {AppError} if any issue occurs
     */
    static async denyAppointment(person_id, appointment_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ person_id, appointment_id } = validateIDFieldsForAppointment({ person_id, appointment_id }));

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError(
                    "You are not a staff member of any hospital",
                    STATUS_CODES.FORBIDDEN
                );
            }

            validateFieldsForDenyAppointment({ appointment, hospitalStaff });

            const query = {
                text: `UPDATE appointment
                SET
                status = '${VALID_APPOINTMENT_STATUSES_OBJECT.DENIED}'
                WHERE
                appointment_id = $1
                RETURNING *`,
                values: [appointment_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("failed to deny appointment", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            await this.recordAppointmentEvent({
                actor_person_id: person_id,
                logAction: `Appointment ${appointment_id} denied by hospital staff ${person_id}, previous_status ${appointment.status}`,
                notifications: [
                    {
                        person_id: appointment.patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Appointment Request Denied",
                        message: `Your appointment request #${appointment_id} was denied by the hospital.`,
                        type: "alert",
                        related_id: appointment_id,
                    },
                ],
            });

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.denyAppointment: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Cancels an appointment.
     * Only the patient who created the appointment can cancel it.
     * @param {number} patient_id - The ID of the patient canceling the appointment.
     * @param {number} appointment_id - The ID of the appointment to cancel.
     * @returns {Promise<Object>} - The canceled appointment object.
     * @throws {AppError} if any issue occurs
     */
    static async cancelAppointment(patient_id, appointment_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ patient_id, appointment_id } = validateIDFieldsForAppointment({ patient_id, appointment_id }));

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            validateFieldsForCancelAppointment({ patient_id, appointment });

            const query = {
                text: `UPDATE appointment
                SET
                status = '${VALID_APPOINTMENT_STATUSES_OBJECT.CANCELLED}'
                WHERE
                appointment_id = $1
                RETURNING *`,
                values: [appointment_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("failed to cancel appointment", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            await this.recordAppointmentEvent({
                actor_person_id: patient_id,
                logAction: `Appointment ${appointment_id} cancelled by patient ${patient_id}, previous_status ${appointment.status}`,
                notifications: [
                    {
                        person_id: appointment.doctor_id,
                        role: VALID_ROLES_OBJECT.DOCTOR,
                        title: "Appointment Cancelled",
                        message: `Appointment #${appointment_id} was cancelled by the patient.`,
                        type: "alert",
                        related_id: appointment_id,
                    },
                ],
            });

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.cancelAppointment: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Reschedules an appointment.
     * Only the patient who created the appointment can reschedule it.
     * @param {Object} params - The parameters for rescheduling the appointment.
     * @param {number} params.patient_id - The ID of the patient rescheduling the appointment.
     * @param {number} params.appointment_id - The ID of the appointment to reschedule.
     * @param {number} params.doctor_id - The ID of the new doctor.
     * @param {string} params.date - The new date of the appointment (YYYY-MM-DD).
     * @param {string} params.time - The new time of the appointment (HH:MM).
     * @param {string} params.reason - The reason for rescheduling.
     * @returns {Promise<Object>} - The rescheduled appointment object.
     * @throws {AppError} if any issue occurs
     */
    static async rescheduleAppointmentForPatient({patient_id, appointment_id, doctor_id, date, time, reason}) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!date) {
                throw new AppError("date is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!time) {
                throw new AppError("time is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!reason) {
                throw new AppError("reason is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ patient_id, appointment_id, doctor_id } = validateIDFieldsForAppointment({ patient_id, appointment_id, doctor_id }));

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            const doctor = await DoctorService.getDoctorIfExists(doctor_id);
            if (!doctor) {
                throw new AppError("doctor doesnt exist", STATUS_CODES.BAD_REQUEST);
            }

            ({ date, time, reason } = validateFieldsForRescheduleAppointmentForPatient({ patient_id, appointment, doctor, date, time, reason }));

            // Preserve original context for doctors by appending patient reschedule reason.
            const previousReason = String(appointment.reason || "").trim();
            const newReason = String(reason || "").trim();
            if (previousReason && newReason && previousReason !== newReason) {
                reason = `${previousReason} | Reschedule note: ${newReason}`;
            }

            const clash = await this.checkAppointmentClashIfExists({doctor_id, date, time});
            if (clash) {
                throw new AppError("Doctor already has an appointment at this date and time", STATUS_CODES.CONFLICT);
            }

            const query = {
                text: `UPDATE appointment
                SET
                doctor_id = $1,
                date = $2,
                time = $3,
                reason = $4,
                status = '${VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING}'
                WHERE
                appointment_id = $5
                RETURNING *`,
                values: [doctor_id, date, time, reason, appointment_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("failed to reschedule appointment", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            await this.recordAppointmentEvent({
                actor_person_id: patient_id,
                logAction: `Appointment ${appointment_id} reschedule requested by patient ${patient_id}: doctor ${doctor_id}, new schedule ${date} ${time}, previous_status ${appointment.status}`,
                notifications: [
                    {
                        person_id: doctor_id,
                        role: VALID_ROLES_OBJECT.DOCTOR,
                        title: "Appointment Reschedule Requested",
                        message: `Appointment #${appointment_id} has a reschedule request to ${date} at ${time}.`,
                        type: "system",
                        related_id: appointment_id,
                    },
                    {
                        person_id: patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Reschedule Request Submitted",
                        message: `Your reschedule request for appointment #${appointment_id} has been submitted for hospital review.`,
                        type: "system",
                        related_id: appointment_id,
                    },
                ],
            });

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.rescheduleAppointmentForPatient: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Reschedules an appointment.
     * Only hospital staff can reschedule appointments for their hospital.
     * @param {Object} params - The parameters for rescheduling the appointment.
     * @param {number} params.person_id - The ID of the hospital staff member rescheduling the appointment.
     * @param {number} params.appointment_id - The ID of the appointment to reschedule.
     * @param {number} params.doctor_id - The ID of the new doctor.
     * @param {string} params.date - The new date of the appointment (YYYY-MM-DD).
     * @param {string} params.time - The new time of the appointment (HH:MM).
     * @returns {Promise<Object>} - The rescheduled appointment object.
     * @throws {AppError} if any issue occurs
     */
    static async rescheduleAppointmentForHospitalStaff({person_id, appointment_id, doctor_id, date, time}) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!date) {
                throw new AppError("date is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!time) {
                throw new AppError("time is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ person_id, appointment_id, doctor_id } = validateIDFieldsForAppointment({ person_id, appointment_id, doctor_id }));

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!hospitalStaff) {
                throw new AppError(
                    "You are not a staff member of any hospital",
                    STATUS_CODES.FORBIDDEN
                );
            }

            const doctor = await DoctorService.getDoctorIfExists(doctor_id);
            if (!doctor) {
                throw new AppError("doctor doesnt exist", STATUS_CODES.BAD_REQUEST);
            }

            ({ date, time } = validateFieldsForRescheduleAppointmentForHospitalStaff({ appointment, hospitalStaff, doctor, date, time }));

            const clash = await this.checkAppointmentClashIfExists({doctor_id, date, time});
            if (clash) {
                throw new AppError("Doctor already has an appointment at this date and time", STATUS_CODES.CONFLICT);
            }

            const query = {
                text: `UPDATE appointment
                SET
                doctor_id = $1,
                date = $2,
                time = $3,
                status = '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}'
                WHERE
                appointment_id = $4
                RETURNING *`,
                values: [doctor_id, date, time, appointment_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("failed to approve appointment", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            await this.recordAppointmentEvent({
                actor_person_id: person_id,
                logAction: `Appointment ${appointment_id} rescheduled by hospital staff ${person_id}: doctor ${doctor_id}, new schedule ${date} ${time}, previous_status ${appointment.status}`,
                notifications: [
                    {
                        person_id: appointment.patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Appointment Rescheduled",
                        message: `Your appointment #${appointment_id} was rescheduled to ${date} at ${time}.`,
                        type: "system",
                        related_id: appointment_id,
                    },
                    {
                        person_id: doctor_id,
                        role: VALID_ROLES_OBJECT.DOCTOR,
                        title: "Appointment Schedule Updated",
                        message: `Appointment #${appointment_id} has been rescheduled to ${date} at ${time}.`,
                        type: "system",
                        related_id: appointment_id,
                    },
                ],
            });

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.rescheduleAppointmentForHospitalStaff: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Starts an appointment, changing its status to 'in progress'.
     * Only the doctor assigned to the appointment can start it.
     * @param {number} doctor_id - The ID of the doctor starting the appointment.
     * @param {number} appointment_id - The ID of the appointment to start.
     * @returns {Promise<Object>} - The started appointment object.
     * @throws {AppError} if any issue occurs
     */
    static async startAppointment(doctor_id, appointment_id) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            await this.validateDoctorScopedAppointmentAction(doctor_id, appointment);

            validateFieldsForStartAppointment({ doctor_id, appointment });

            const query = {
                text: `UPDATE appointment
                SET
                status = '${VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS}',
                started_at = CURRENT_TIMESTAMP
                WHERE
                appointment_id = $1
                RETURNING *`,
                values: [appointment_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("failed to start appointment", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            await this.recordAppointmentEvent({
                actor_person_id: doctor_id,
                logAction: `Appointment ${appointment_id} started by doctor ${doctor_id}`,
                notifications: [
                    {
                        person_id: appointment.patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Appointment In Progress",
                        message: `Your appointment #${appointment_id} is now in progress.`,
                        type: "system",
                        related_id: appointment_id,
                    },
                ],
            });

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.startAppointment: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    static async orderLabTests(doctor_id, appointment_id) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            await this.validateDoctorScopedAppointmentAction(doctor_id, appointment);

            validateFieldsForOrderLabTests({ doctor_id, appointment });

            const query = {
                text: `UPDATE appointment
                SET
                lab_tests_ordered = TRUE
                WHERE
                appointment_id = $1`,
                values: [appointment_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("failed to order lab tests", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.orderLabTests: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    static async hospitalizeAppointment(doctor_id, appointment_id) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            await this.validateDoctorScopedAppointmentAction(doctor_id, appointment);
            validateFieldsForHospitalizeAppointment({ doctor_id, appointment });

            const hospital = await HospitalService.getHospitalIfExists(appointment.hospital_id);
            const appliedDailyCharge = Number(hospital?.hospitalization_daily_charge || 0);

            const query = {
                text: `UPDATE appointment
                SET
                appointment_type = 'hospitalization',
                admission_date = COALESCE(admission_date, CURRENT_DATE),
                applied_hospitalization_daily_charge = $2
                WHERE
                appointment_id = $1
                RETURNING *`,
                values: [appointment_id, appliedDailyCharge],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("failed to hospitalize appointment", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            await this.recordAppointmentEvent({
                actor_person_id: doctor_id,
                logAction: `Appointment ${appointment_id} marked as hospitalization by doctor ${doctor_id}`,
                notifications: [
                    {
                        person_id: appointment.patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Admission Started",
                        message: `Your appointment #${appointment_id} has been marked for hospitalization. The hospital stay charge has been applied as per hospital policy.`,
                        type: "system",
                        related_id: appointment_id,
                    },
                ],
            });

            return result.rows[0];
        } catch (error) {
            console.error(`Error in AppointmentService.hospitalizeAppointment: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async dischargeAppointment(doctor_id, appointment_id, {
        history_of_present_illness = null,
        review_of_systems = null,
        physical_exam = null,
        diagnosis = null,
        plan = null,
    } = {}) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            await this.validateDoctorScopedAppointmentAction(doctor_id, appointment);
            validateFieldsForDischargeAppointment({ doctor_id, appointment });

            // --- Hospitalization charge calculation ---
            // Use CURRENT_DATE as discharge date; admission_date must exist at this point
            const admissionDate = new Date(appointment.admission_date);
            const dischargeDate = new Date();
            dischargeDate.setHours(0, 0, 0, 0);

            if (!appointment.admission_date) {
                throw new AppError(
                    "Appointment does not have an admission date",
                    STATUS_CODES.BAD_REQUEST
                );
            }

            // At minimum 1 day charge even for same-day discharge
            const msPerDay = 1000 * 60 * 60 * 24;
            const daysHospitalized = Math.max(
                1,
                Math.ceil((dischargeDate - admissionDate) / msPerDay)
            );

            const dailyRate = Number(appointment.applied_hospitalization_daily_charge || 0);
            const hospitalizationTotalCharge = daysHospitalized * dailyRate;

            // --- Persist discharge + notes + hospitalization charge in one atomic update ---
            const query = {
                text: `UPDATE appointment
                SET
                    status                         = '${VALID_APPOINTMENT_STATUSES_OBJECT.COMPLETED}',
                    completed_at                   = CURRENT_TIMESTAMP,
                    discharge_date                 = CURRENT_DATE,
                    history_of_present_illness     = COALESCE($1, history_of_present_illness),
                    review_of_systems              = COALESCE($2, review_of_systems),
                    physical_exam                  = COALESCE($3, physical_exam),
                    diagnosis                      = COALESCE($4, diagnosis),
                    plan                           = COALESCE($5, plan),
                    hospitalization_total_charge   = $6
                WHERE
                    appointment_id = $7
                RETURNING *`,
                values: [
                    history_of_present_illness,
                    review_of_systems,
                    physical_exam,
                    diagnosis,
                    plan,
                    hospitalizationTotalCharge,
                    appointment_id,
                ],
            };

            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(
                    "Failed to discharge appointment",
                    STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            // --- Use final merged values for downstream steps ---
            // After COALESCE, the DB has the final values — pull from result row
            const finalRow = result.rows[0];

            // --- Patient medical history ---
            if (finalRow.diagnosis) {
                const patientDiagnosis = finalRow.diagnosis.split(',').map(item => item.trim());
                for (const diag of patientDiagnosis) {
                    await PatientMedicalHistoryService.insertPatientMedicalHistoryIfNotExists(
                        appointment.patient_id,
                        diag,
                        new Date()
                    );
                }
            }

            // --- Medical coding ---
            let prescriptions = await PrescriptionService.getPrescriptionsAgainstAppointmentIfExists(
                appointment.patient_id, appointment_id
            );
            if (!prescriptions) prescriptions = [];

            let verifiedDocs = await AppointmentDocumentsService.getVerifiedDocumentsAgainstAppointmentIfExists(appointment_id);
            if (!verifiedDocs) verifiedDocs = [];

            let unverifiedDocs = await AppointmentDocumentsService.getUnverifiedDocumentsAgainstAppointmentIfExists(appointment_id);
            if (!unverifiedDocs) unverifiedDocs = [];

            const provider_notes = this.buildProviderNotesForMedicalCoding({
                history_of_present_illness: finalRow.history_of_present_illness,
                review_of_systems:          finalRow.review_of_systems,
                physical_exam:              finalRow.physical_exam,
                diagnosis:                  finalRow.diagnosis,
                plan:                       finalRow.plan,
                prescriptions,
                verifiedDocs,
                unverifiedDocs,
            });

            const codingResponse = await axios.post(
                `${AI_MEDICAL_CODING_API_BASE_URL}${AI_MEDICAL_CODING_GENERATE_CODES_ENDPOINT}`,
                { provider_notes }
            );
            const { icd_codes, cpt_codes } = codingResponse.data;

            if (icd_codes?.length > 0) {
                for (const icd_code of icd_codes) {
                    await AppointmentICDService.insertAppointmentICDCode(
                        appointment_id, icd_code.code, icd_code.description
                    );
                }
            }
            if (cpt_codes?.length > 0) {
                for (const cpt_code of cpt_codes) {
                    await AppointmentCPTService.insertAppointmentCPTCode(
                        appointment_id, cpt_code.code, cpt_code.description
                    );
                }
            }

            // --- Bill generation ---
            // BillService.generateBillAgainstAppointment should read
            // hospitalization_total_charge from the appointment row and add it
            // on top of the base appointment_cost when building the bill
            await BillService.generateBillAgainstAppointment(appointment_id);

            await this.recordAppointmentEvent({
                actor_person_id: doctor_id,
                logAction: `Appointment ${appointment_id} discharged and completed by doctor ${doctor_id}; days_hospitalized ${daysHospitalized}; daily_rate ${dailyRate}; hospitalization_total ${hospitalizationTotalCharge}`,
                notifications: [
                    {
                        person_id: appointment.patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Discharged",
                        message: `You have been discharged for appointment #${appointment_id}. A bill has been generated for your ${daysHospitalized} day(s) of hospitalization.`,
                        type: "system",
                        related_id: appointment_id,
                    },
                ],
            });

            return finalRow;
        } catch (error) {
            console.error(
                `Error in AppointmentService.dischargeAppointment: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Updates clinical notes on an in-progress appointment without completing it.
     * Intended for use during hospitalization to progressively save doctor notes.
     * Does NOT trigger billing, medical coding, or status changes.
     * @param {Object} params
     * @param {number|string} params.doctor_id
     * @param {number|string} params.appointment_id
     * @param {string} [params.history_of_present_illness]
     * @param {string} [params.review_of_systems]
     * @param {string} [params.physical_exam]
     * @param {string} [params.diagnosis]
     * @param {string} [params.plan]
     * @returns {Promise<Object>} - The updated appointment object.
     * @throws {AppError} if any issue occurs
     */
    static async updateAppointmentNotesForDoctor({
        doctor_id,
        appointment_id,
        history_of_present_illness = null,
        review_of_systems = null,
        physical_exam = null,
        diagnosis = null,
        plan = null,
    }) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            await this.validateDoctorScopedAppointmentAction(doctor_id, appointment);

            // Only allow note updates on in-progress appointments
            if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS) {
                throw new AppError(
                    "Notes can only be updated on in-progress appointments",
                    STATUS_CODES.BAD_REQUEST
                );
            }

            // Only meaningful during hospitalization
            if (appointment.appointment_type !== "hospitalization") {
                throw new AppError(
                    "Interim note updates are only allowed for hospitalization appointments",
                    STATUS_CODES.BAD_REQUEST
                );
            }

            // Null fields fall back to whatever is already stored — no accidental overwrites
            const query = {
                text: `UPDATE appointment
                SET
                    history_of_present_illness = COALESCE($1, history_of_present_illness),
                    review_of_systems         = COALESCE($2, review_of_systems),
                    physical_exam             = COALESCE($3, physical_exam),
                    diagnosis                 = COALESCE($4, diagnosis),
                    plan                      = COALESCE($5, plan)
                WHERE
                    appointment_id = $6
                RETURNING *`,
                values: [
                    history_of_present_illness,
                    review_of_systems,
                    physical_exam,
                    diagnosis,
                    plan,
                    appointment_id,
                ],
            };

            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError(
                    "Failed to update appointment notes",
                    STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            await this.recordAppointmentEvent({
                actor_person_id: doctor_id,
                logAction: `Appointment ${appointment_id} notes updated during hospitalization by doctor ${doctor_id}`,
                notifications: [], // Silent save — no need to ping the patient for every interim save
            });

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.updateAppointmentNotesForDoctor: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Completes an appointment, adding a doctor's note.
     * Only the doctor assigned to the appointment can complete it.
     * @param {Object} params - The parameters for completing the appointment.
     * @param {number} params.doctor_id - The ID of the doctor completing the appointment.
     * @param {number} params.appointment_id - The ID of the appointment to complete.
     * @param {string} params.history_of_present_illness - The history of present illness.
     * @param {string} params.review_of_systems - The review of systems.
     * @param {string} params.physical_exam - The physical exam findings.
     * @param {string} params.diagnosis - The diagnosis.
     * @param {string} params.plan - The treatment plan.
     * @returns {Promise<Object>} - The completed appointment object.
     * @throws {AppError} if any issue occurs
     */
    static async completeAppointmentForDoctor({doctor_id, appointment_id, history_of_present_illness, review_of_systems, physical_exam, diagnosis, plan}) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            await this.validateDoctorScopedAppointmentAction(doctor_id, appointment);

            ({ history_of_present_illness, review_of_systems, physical_exam, diagnosis, plan } = validateFieldsForCompleteAppointment({ doctor_id, appointment, history_of_present_illness, review_of_systems, physical_exam, diagnosis, plan }));

            const query = {
                text: `UPDATE appointment
                SET
                status = '${VALID_APPOINTMENT_STATUSES_OBJECT.COMPLETED}',
                completed_at = CURRENT_TIMESTAMP,
                history_of_present_illness = $1,
                review_of_systems = $2,
                physical_exam = $3,
                diagnosis = $4,
                plan = $5
                WHERE
                appointment_id = $6
                RETURNING *`,
                values: [history_of_present_illness, review_of_systems, physical_exam, diagnosis, plan, appointment_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("failed to complete appointment", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            const patientDiagnosis = diagnosis.split(',').map(item => item.trim());
            console.log("Patient diagnosis list for medical history update:", patientDiagnosis);
            for (const diag of patientDiagnosis) {
                await PatientMedicalHistoryService.insertPatientMedicalHistoryIfNotExists(appointment.patient_id, diag, new Date());
            }

            if ((appointment.lab_tests_ordered && appointment.lab_tests_completed) || !appointment.lab_tests_ordered) {
                // Keep coding payload focused on current appointment details only.
                // const patient = await PatientService.getPatientIfExists(appointment.patient_id);
                // if (!patient) {
                //     throw new AppError("Patient not found", STATUS_CODES.NOT_FOUND);
                // }
                // const { smoking, alcohol, drug_use } = patient;

                // let patientAllergies = await PatientAllergyService.getPatientAllergiesIfExists(appointment.patient_id);
                // if (!patientAllergies) {
                //     patientAllergies = [];
                // }
                // let patientFamilyHistories = await PatientFamilyHistoryService.getPatientFamilyHistoryIfExists(appointment.patient_id);
                // if (!patientFamilyHistories) {
                //     patientFamilyHistories = [];
                // }
                // let patientSurgicalHistories = await PatientSurgicalHistoryService.getPatientSurgicalHistoryIfExists(appointment.patient_id);
                // if (!patientSurgicalHistories) {
                //     patientSurgicalHistories = [];
                // }
                // let patientMedicalHistories = await PatientMedicalHistoryService.getPatientMedicalHistoryIfExists(appointment.patient_id);
                // if (!patientMedicalHistories) {
                //     patientMedicalHistories = [];
                // }

                let prescriptions = await PrescriptionService.getPrescriptionsAgainstAppointmentIfExists(appointment.patient_id, appointment_id);
                if (!prescriptions) {
                    prescriptions = [];
                }

                // let currentPrescriptions = await PrescriptionService.getCurrentPrescriptionsForPatient(appointment.patient_id);
                // if (!currentPrescriptions) {
                //     currentPrescriptions = [];
                // }

                let verifiedDocs = await AppointmentDocumentsService.getVerifiedDocumentsAgainstAppointmentIfExists(appointment_id);
                if (!verifiedDocs) {
                    verifiedDocs = [];
                }

                let unverifiedDocs = await AppointmentDocumentsService.getUnverifiedDocumentsAgainstAppointmentIfExists(appointment_id);
                if (!unverifiedDocs) {
                    unverifiedDocs = [];
                }

                const provider_notes = this.buildProviderNotesForMedicalCoding({
                    history_of_present_illness,
                    review_of_systems,
                    physical_exam,
                    diagnosis,
                    plan,
                    prescriptions,
                    verifiedDocs,
                    unverifiedDocs,
                });

                const response = await axios.post(`${AI_MEDICAL_CODING_API_BASE_URL}${AI_MEDICAL_CODING_GENERATE_CODES_ENDPOINT}`, {
                    provider_notes: provider_notes
                });
                const { icd_codes, cpt_codes } = response.data;
                if (icd_codes && icd_codes.length > 0) {
                    for (const icd_code of icd_codes) {
                        await AppointmentICDService.insertAppointmentICDCode(appointment_id, icd_code.code, icd_code.description);
                    }
                }
                if (cpt_codes && cpt_codes.length > 0) {
                    for (const cpt_code of cpt_codes) {
                        await AppointmentCPTService.insertAppointmentCPTCode(appointment_id, cpt_code.code, cpt_code.description);
                    }
                }

                await BillService.generateBillAgainstAppointment(appointment_id);
            }

            await this.recordAppointmentEvent({
                actor_person_id: doctor_id,
                logAction: `Appointment ${appointment_id} completed by doctor ${doctor_id}; diagnosis_count ${patientDiagnosis.length}; lab_tests_ordered ${Boolean(appointment.lab_tests_ordered)}`,
                notifications: [
                    {
                        person_id: appointment.patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Appointment Completed",
                        message: `Your appointment #${appointment_id} has been completed by your doctor.`,
                        type: "system",
                        related_id: appointment_id,
                    },
                ],
            });

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.completeAppointment: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    static async completeLabTests(patient_id, appointment_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const appointment = await this.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }

            validateFieldsForCompleteLabTests({ patient_id, appointment });

            const query = {
                text: `UPDATE appointment
                SET
                lab_tests_completed = TRUE
                WHERE
                appointment_id = $1
                RETURNING *`,
                values: [appointment_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("failed to complete lab tests", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            if (appointment.status === VALID_APPOINTMENT_STATUSES_OBJECT.COMPLETED) {
                // Keep coding payload focused on current appointment details only.
                // const patient = await PatientService.getPatientIfExists(appointment.patient_id);
                // if (!patient) {
                //     throw new AppError("Patient not found", STATUS_CODES.NOT_FOUND);
                // }
                // const { smoking, alcohol, drug_use } = patient;

                // let patientAllergies = await PatientAllergyService.getPatientAllergiesIfExists(appointment.patient_id);
                // if (!patientAllergies) {
                //     patientAllergies = [];
                // }
                // let patientFamilyHistories = await PatientFamilyHistoryService.getPatientFamilyHistoryIfExists(appointment.patient_id);
                // if (!patientFamilyHistories) {
                //     patientFamilyHistories = [];
                // }
                // let patientSurgicalHistories = await PatientSurgicalHistoryService.getPatientSurgicalHistoryIfExists(appointment.patient_id);
                // if (!patientSurgicalHistories) {
                //     patientSurgicalHistories = [];
                // }
                // let patientMedicalHistories = await PatientMedicalHistoryService.getPatientMedicalHistoryIfExists(appointment.patient_id);
                // if (!patientMedicalHistories) {
                //     patientMedicalHistories = [];
                // }

                let prescriptions = await PrescriptionService.getPrescriptionsAgainstAppointmentIfExists(appointment.patient_id, appointment_id);
                if (!prescriptions) {
                    prescriptions = [];
                }

                // let currentPrescriptions = await PrescriptionService.getCurrentPrescriptionsForPatient(appointment.patient_id);
                // if (!currentPrescriptions) {
                //     currentPrescriptions = [];
                // }

                let verifiedDocs = await AppointmentDocumentsService.getVerifiedDocumentsAgainstAppointmentIfExists(appointment_id);
                if (!verifiedDocs) {
                    verifiedDocs = [];
                }

                let unverifiedDocs = await AppointmentDocumentsService.getUnverifiedDocumentsAgainstAppointmentIfExists(appointment_id);
                if (!unverifiedDocs) {
                    unverifiedDocs = [];
                }

                const provider_notes = this.buildProviderNotesForMedicalCoding({
                    history_of_present_illness: appointment.history_of_present_illness,
                    review_of_systems: appointment.review_of_systems,
                    physical_exam: appointment.physical_exam,
                    diagnosis: appointment.diagnosis,
                    plan: appointment.plan,
                    prescriptions,
                    verifiedDocs,
                    unverifiedDocs,
                });

                const response = await axios.post(`${AI_MEDICAL_CODING_API_BASE_URL}${AI_MEDICAL_CODING_GENERATE_CODES_ENDPOINT}`, {
                    provider_notes: provider_notes
                });
                const { icd_codes, cpt_codes } = response.data;
                if (icd_codes && icd_codes.length > 0) {
                    for (const icd_code of icd_codes) {
                        await AppointmentICDService.insertAppointmentICDCode(appointment_id, icd_code.code, icd_code.description);
                    }
                }
                if (cpt_codes && cpt_codes.length > 0) {
                    for (const cpt_code of cpt_codes) {
                        await AppointmentCPTService.insertAppointmentCPTCode(appointment_id, cpt_code.code, cpt_code.description);
                    }
                }

                await BillService.generateBillAgainstAppointment(appointment_id);
            }

            await this.recordAppointmentEvent({
                actor_person_id: patient_id,
                logAction: `Lab tests marked completed for appointment ${appointment_id} by patient ${patient_id}`,
                notifications: [
                    {
                        person_id: appointment.doctor_id,
                        role: VALID_ROLES_OBJECT.DOCTOR,
                        title: "Lab Tests Completed",
                        message: `Lab tests for appointment #${appointment_id} were marked completed by the patient.`,
                        type: "system",
                        related_id: appointment_id,
                    },
                ],
            });

            return result.rows[0];
        }catch (error) {
            console.error(
                `Error in AppointmentService.completeLabTests: ${error.message} ${error.status}`
            );
            throw error;
        }
    }

    /**
     * Checks if an appointment clash exists for a given doctor, date, and time.
     * @param {Object} params - The parameters for the check.
     * @param {number} params.doctor_id - The ID of the doctor.
     * @param {string} params.date - The date of the appointment (YYYY-MM-DD).
     * @param {string} params.time - The time of the appointment (HH:MM).
     * @return {Promise<Object|boolean>} - The existing appointment object if a clash exists, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async checkAppointmentClashIfExists({doctor_id, date, time}) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!date) {
                throw new AppError("date is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!time) {
                throw new AppError("time is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM appointment
                WHERE
                doctor_id = $1 AND date = $2 AND time = $3
                AND status = '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}'`,
                values: [doctor_id, date, time],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(
                `Error in AppointmentService.checkAppointmentClashIfExists: ${error.message} ${error.status}`
            );
            throw error;
        }
    }
}

module.exports = { AppointmentService };