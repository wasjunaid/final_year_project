const { pool } = require("../../config/databaseConfig");
const { PersonService } = require("../Person/PersonService");
const { PatientService } = require("../Patient/PatientService");
const { UnverifiedDocumentService } = require("../Document/UnverifiedDocumentService");
const { AppointmentService } = require("../Appointment/AppointmentService");
const { EHRAccessRequestService } = require("./EHRAccessRequestService");
const { EHRAccessService } = require("./EHRAccessService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class EHRService {
    static async getEHR(patient_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const person = await PersonService.getPerson(patient_id);
            const patient = await PatientService.getPatient(patient_id);
            const unverifiedDocuments = await UnverifiedDocumentService.getUnverifiedDocumentsForEHR(patient_id);
            const appointments = await AppointmentService.getAppointmentsForEHR(patient_id);
            
            return {
                personData: person,
                patientData: patient,
                unverifiedDocuments: unverifiedDocuments || [],
                appointments: appointments || []
            }
        } catch (error) {
            console.error(`Error getting ehr: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getEHRAgainstAppointment(appointment_id) {
        if (!appointment_id) {
            throw new AppError("appointment_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            // checks if right doctor is accessing the ehr

            const query = {
                text: `SELECT
                pr.dosage as prescription_dosage,
                pr.instruction as prescription_instruction,
                m.name as medicine_name,
                lt.name as lab_test_name,
                lt.description as lab_test_description,
                vd.document_id,
                vd.original_name as document_original_name,
                vd.mime_type as document_mime_type,
                vd.file_size as document_file_size,
                vd.created_at as document_uploaded_at,
                vd.detail as document_detail
                FROM appointment a
                JOIN appointment_request ar ON a.appointment_id = ar.appointment_request_id
                JOIN doctor d ON ar.doctor_id = d.doctor_id
                JOIN person p ON d.person_id = p.person_id
                JOIN doctor_note dn ON a.appointment_id = dn.appointment_id
                JOIN prescription pr ON a.appointment_id = pr.appointment_id
                JOIN medicine m ON pr.medicine_id = m.medicine_id
                JOIN verified_document vd ON a.appointment_id = vd.appointment_id
                JOIN lab_test lt ON vd.lab_test_id = lt.lab_test_id
                WHERE
                a.appointment_id = $1`,
                values: [appointment_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Detail not found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting ehr against appointment: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getEHRForDoctor(patient_id, doctor_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!doctor_id) {
            throw new AppError("doctor_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            let access;

            const checkAccessRequestExists = await EHRAccessRequestService.checkEHRAccessRequestExists(doctor_id, patient_id);

            const checkEHRAccessExists = await EHRAccessService.checkEHRAccessExists(patient_id, doctor_id);
            
            if (!checkAccessRequestExists) {
                if (!checkEHRAccessExists) {
                    throw new AppError("No EHR access request or access found", statusCodes.NOT_FOUND);
                } else {
                    access = await EHRAccessService.getEHRAccess(checkEHRAccessExists);
                }
            } else {
                access = await EHRAccessRequestService.getEHRAccessRequest(doctor_id, patient_id);
            }

            if (access.status !== 'approved' && access.status !== 'granted') {
                throw new AppError("EHR access is not approved or granted", statusCodes.FORBIDDEN);
            }

            const result = await this.getEHR(patient_id);

            return result;
        } catch (error) {
            console.error(`Error getting ehr for doctor: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { EHRService };