const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PersonService } = require("../Person/PersonService");
const { PatientService } = require("../Patient/PatientService");
const { AppointmentDetailService } = require("../Appointment/AppointmentDetailService");
const { EHRAccessService } = require("./EHRAccessService");
const { DocumentService } = require("../Document/DocumentService");
const { VALID_EHR_ACCESS_STATUSES_OBJECT } = require("../../utils/validConstantsUtil");
const { PrescriptionService } = require("../Prescription/PrescriptionService");

class EHRService {
    /**
     * Retrieves the complete EHR for a given patient.
     * @param {number} patient_id - The ID of the patient.
     * @returns {Promise<object>} The EHR object containing person data, patient data, unverified documents, and appointments.
     * @throws {AppError} if any issue occurs
     */
    static async getEHR(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const person = await PersonService.getPerson(patient_id);
            const patient = await PatientService.getPatient(patient_id);
            const unverifiedDocuments = await DocumentService.getAllUnverifiedDocumentsIfExists(patient_id);
            const appointments = await AppointmentDetailService.getAppointmentsForEHRIfExists(patient_id);
            
            return {
                personData: person,
                patientData: patient,
                unverifiedDocuments: unverifiedDocuments || [],
                appointments: appointments || []
            }
        } catch (error) {
            console.error(`Error in EHRService.getEHR: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Retrieves the EHR against a specific appointment if the doctor has access.
     * @param {object} params - The parameters object.
     * @param {number} params.doctor_id - The ID of the doctor.
     * @param {number} params.patient_id - The ID of the patient.
     * @param {number} params.appointment_id - The ID of the appointment.
     * @returns {Promise<object>} The EHR data related to the appointment.
     * @throws {AppError} if any issue occurs
     */
    static async getEHRAgainstAppointment({doctor_id, patient_id, appointment_id}) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }
            
            const ehrAccess = await EHRAccessService.getEHRAccessIfExistsUsingPatientAndDoctorID(patient_id, doctor_id);
            if (!ehrAccess) {
                throw new AppError("No EHR access found", STATUS_CODES.NOT_FOUND);
            }

            if (ehrAccess.status !== VALID_EHR_ACCESS_STATUSES_OBJECT.GRANTED) {
                throw new AppError("EHR access is not granted", STATUS_CODES.FORBIDDEN);
            }

            const appointment = await AppointmentDetailService.getAppointmentDetailsIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("No appointment found", STATUS_CODES.NOT_FOUND);
            }

            if (appointment.patient_id !== patient_id) {
                throw new AppError("Appointment does not belong to the specified patient", STATUS_CODES.BAD_REQUEST);
            }

            let docs;
            if (appointment.lab_test_required) {
                docs = await DocumentService.getAllVerifiedDocumentsAgainstAppointmentIfExists(patient_id, appointment_id);
            }

            let pres;
            if (appointment.prescription_required) {
                pres = await PrescriptionService.getPrescriptionsAgainstAppointmentIfExists(patient_id, appointment_id);
            }

            return {
                appointmentDetails: appointment,
                documents: docs || [],
                prescriptions: pres || []
            };
        } catch (error) {
            console.error(`Error in EHRService.getEHRAgainstAppointment: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Retrieves the EHR for a doctor if they have access.
     * @param {number} doctor_id - The ID of the doctor.
     * @param {number} patient_id - The ID of the patient.
     * @returns {Promise<object>} The EHR object.
     * @throws {AppError} if any issue occurs
     */
    static async getEHRForDoctor(doctor_id, patient_id) {
        try {
            if (!doctor_id) {
                throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const ehrAccess = await EHRAccessService.getEHRAccessIfExistsUsingPatientAndDoctorID(patient_id, doctor_id);
            if (!ehrAccess) {
                throw new AppError("No EHR access found", STATUS_CODES.NOT_FOUND);
            }

            if (ehrAccess.status !== VALID_EHR_ACCESS_STATUSES_OBJECT.GRANTED) {
                throw new AppError("EHR access is not granted", STATUS_CODES.FORBIDDEN);
            }

            const result = await this.getEHR(patient_id);

            return result;
        } catch (error) {
            console.error(`Error in EHRService.getEHRForDoctor: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { EHRService };