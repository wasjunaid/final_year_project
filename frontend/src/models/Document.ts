export type DocumentType = 'personal' | 'lab test' | 'prescription';

export interface Document {
  document_id: string; // Changed from number to string since backend uses UUID
  patient_id?: number;
  original_name?: string;
  file_name?: string;
  mime_type?: string;
  file_path?: string;
  file_size?: number;
  document_type?: DocumentType;
  detail?: string;
  uploaded_by?: number;
  appointment_id?: number;
  lab_test_id?: number;
  lab_test_cost?: number;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Fields from views
  uploader_name?: string;
  uploader_email?: string;
  verifier_name?: string;
  
  // Legacy fields that might come from different endpoints
  file_url?: string;
  file_type?: string;
  uploaded_for?: 'SELF' | 'APPOINTMENT' | 'LAB_TEST';
  verified_by?: number;
  verified_at?: string;
  appointment_details?: {
    appointment_id: number;
    doctor_name: string;
    hospital_name: string;
    appointment_date: string;
  };
}

export interface DocumentUploadRequest {
  file: File;
  document_type: DocumentType;
  detail: string;
  uploaded_for?: 'SELF' | 'APPOINTMENT' | 'LAB_TEST';
  appointment_id?: number;
  lab_test_id?: number;
}

export interface VerifiedDocumentUploadRequest {
  file: File;
  document_type: DocumentType;
  detail: string;
  uploaded_for: 'APPOINTMENT' | 'LAB_TEST';
  appointment_id?: number;
  lab_test_id?: number;
  patient_id: number;
}

// Backend returns both formats, so let's support both
export interface DocumentsResponse {
  // Format from instance methods
  verified_documents?: Document[];
  unverified_documents?: Document[];
  
  // Format from static methods
  verified?: Document[];
  unverified?: Document[];
}

export interface AppointmentDocumentsParams {
  appointment_id: number;
}
