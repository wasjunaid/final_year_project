const { PatientMedicalHistoryService } = require("./PatientMedicalHistoryService");
const { PatientAllergyService } = require("./PatientAllergyService");
const { PatientFamilyHistoryService } = require("./PatientFamilyHistoryService");
const { PatientSurgicalHistoryService } = require("./PatientSurgicalHistoryService");
const { PrescriptionService } = require("../Prescription/PrescriptionService");
const { DocumentService } = require("../Document/DocumentService");
const { AppointmentDetailService } = require("../Appointment/AppointmentDetailService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { LogService } = require("../Log/LogService");
const { PatientService } = require("./PatientService");

class PatientEHRService {
    static normalizeDocumentList(documentResult) {
        if (!documentResult) {
            return [];
        }

        if (Array.isArray(documentResult)) {
            return documentResult;
        }

        if (Array.isArray(documentResult.rows)) {
            return documentResult.rows;
        }

        return [];
    }

  /**
     * Retrieves complete EHR data for a patient to share with doctors
     * @param {number} patient_id - The ID of the patient
     * @returns {Promise<Object>} - Complete EHR data object
     * @throws {AppError} if any issue occurs
     */
    static async getPatientEHRDataForSharing(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
            }

            // 1. Get basic patient information
            const patientData = await PatientService.getPatientIfExists(patient_id);
            if (!patientData) {
                throw new AppError('Patient not found', STATUS_CODES.NOT_FOUND);
            }

            // 2. Get patient allergies
            const allergies = await PatientAllergyService.getPatientAllergiesIfExists(patient_id);

            // 3. Get medical history
            const medicalHistory = await PatientMedicalHistoryService.getPatientMedicalHistoryIfExists(patient_id);

            // 4. Get family history
            const familyHistory = await PatientFamilyHistoryService.getPatientFamilyHistoryIfExists(patient_id);

            // 5. Get surgical history
            const surgicalHistory = await PatientSurgicalHistoryService.getPatientSurgicalHistoryIfExists(patient_id);

            // 6. Get current prescriptions
            const currentPrescriptions = await PrescriptionService.getCurrentPrescriptionsForPatient(patient_id);

            // 7. Get verified documents
            const verifiedDocumentsResult = await DocumentService.getAllVerifiedDocumentsIfExists(patient_id);
            const verifiedDocuments = this.normalizeDocumentList(verifiedDocumentsResult);

            // 8. Get unverified documents
            const unverifiedDocumentsResult = await DocumentService.getAllUnverifiedDocumentsIfExists(patient_id);
            const unverifiedDocuments = this.normalizeDocumentList(unverifiedDocumentsResult);

            // 9. Get appointment history with diagnoses (keeping original query as no service exists)
            
            const appointmentHistory = await AppointmentDetailService.getAppointmentsForEHRIfExists(patient_id);

            

            // Compile all EHR data
            const ehrData = {
                patient: patientData,
                allergies: allergies || [],
                medicalHistory: medicalHistory || [],
                familyHistory: familyHistory || [],
                surgicalHistory: surgicalHistory || [],
                currentPrescriptions: currentPrescriptions || [],
                verifiedDocuments: verifiedDocuments || [],
                unverifiedDocuments: unverifiedDocuments || [],
                appointmentHistory: appointmentHistory || [],
                generatedAt: new Date().toISOString()
            };

            await LogService.insertLog(patient_id, `Generated EHR data for sharing`);

            return ehrData;

        } catch (error) {
            console.error(`Error in PatientEHRService.getPatientEHRDataForSharing: ${error.message}`);
            throw error;
        }
    }
}

module.exports = { PatientEHRService };