// Document Payloads - Request data for document operations

export interface UploadUnverifiedDocumentPayload {
  document_type: string;
  detail: string;
}

export interface UploadVerifiedDocumentPayload {
  file: File;
  detail: string;
  appointment_id?: number;
  lab_test_id?: number;
  patient_id?: number;
}

export interface GetAllVerifiedDocumentsAgainstAppointmentPayload {
  appointment_id: number;
}
