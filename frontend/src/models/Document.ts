export interface Document {
  document_id: number;
  document_type: string;
  detail: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  uploaded_for: 'SELF' | 'APPOINTMENT' | 'LAB_TEST';
  appointment_id?: number;
  lab_test_id?: number;
  is_verified: boolean;
  verified_by?: number;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  
  // Extended fields from joins
  uploader_name?: string;
  uploader_email?: string;
  verifier_name?: string;
  appointment_details?: {
    appointment_id: number;
    doctor_name: string;
    hospital_name: string;
    appointment_date: string;
  };
}

export interface DocumentUploadRequest {
  file: File;
  document_type: string;
  detail: string;
  uploaded_for?: 'SELF' | 'APPOINTMENT' | 'LAB_TEST';
  appointment_id?: number;
  lab_test_id?: number;
}

export interface VerifiedDocumentUploadRequest {
  file: File;
  document_type: string;
  detail: string;
  uploaded_for: 'APPOINTMENT' | 'LAB_TEST';
  appointment_id?: number;
  lab_test_id?: number;
  patient_id: number;
}

export interface DocumentsResponse {
  verified_documents: Document[];
  unverified_documents: Document[];
}

export interface AppointmentDocumentsParams {
  appointment_id: number;
}
