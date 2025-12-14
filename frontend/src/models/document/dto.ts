// Document DTOs (Data Transfer Objects) - matches backend API responses

export interface DocumentDto {
  document_id: string;
  patient_id: number;
  original_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  updated_at?: string;
  file_name?: string; // stored filename on server
  ipfs_hash?: string; // optional IPFS hash if stored on IPFS
  document_type?: string | null;
  is_verified: boolean;
  detail: string;
  uploaded_by?: number;
  uploaded_by_first_name?: string;
  uploaded_by_last_name?: string;
  appointment_id?: number;
  hospital_id?: number;
  hospital_name?: string;
  lab_test_id?: number;
  lab_test_name?: string;
  lab_test_description?: string;
  lab_test_cost?: number;
}

export interface UploadUnverifiedDocumentResponseDto {
  data: DocumentDto;
  message: string;
  status: number;
  success: boolean;
}

export interface UploadVerifiedDocumentResponseDto {
  data: DocumentDto;
  message: string;
  status: number;
  success: boolean;
}

export interface GetDocumentResponseDto {
  data: DocumentDto;
  message: string;
  status: number;
  success: boolean;
}

export interface GetAllDocumentsResponseDto {
  data: DocumentDto[];
  message: string;
  status: number;
  success: boolean;
}

export interface GetAllVerifiedDocumentsAgainstAppointmentResponseDto {
  data: DocumentDto[];
  message: string;
  status: number;
  success: boolean;
}
