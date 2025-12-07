// Document Payloads - Request data for document operations

export interface UploadUnverifiedDocumentPayload {
  document_type: string;
  detail: string;
}

export interface UploadVerifiedDocumentPayload {
  originalname: string;
  filename: string;
  mimetype: string;
  filepath: string;
  filesize: number;
  appointment_id: number;
  lab_test_id: number;
  detail: string;
}

export interface GetAllVerifiedDocumentsAgainstAppointmentPayload {
  appointment_id: number;
}
