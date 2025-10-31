export interface DocumentUploadRequest {
  file: File;
  document_type: string;
  detail: string;
  uploaded_for?: string;
  appointment_id?: string;
  lab_test_id?: string;
}


export interface Document {
  document_id: string;
  patient_id: number;
  original_name: string;
  file_name: string;
  mime_type: string;
  file_path: string;
  file_size: number;
  uploaded_by?: number;
  uploaded_by_first_name?: string;
  uploaded_by_last_name?: string;
  appointment_id?: number;
  lab_test_id?: number;
  lab_test_name?: string;
  lab_test_cost?: number;
  detail: string;
  is_verified: boolean;
  document_type: string;
  created_at: string;
  updated_at: string;
}
