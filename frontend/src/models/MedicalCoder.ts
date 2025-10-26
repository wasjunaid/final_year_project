export interface MedicalCoder {
  medical_coder_id: number;
  hospital_id?: number;
  hospital_name?: string;
  created_at: string;
  updated_at: string;
  // Extended fields from person
  first_name?: string;
  last_name?: string;
  email?: string;
  person_name?: string;
}

export interface CreateMedicalCoderRequest {
  person_id: number;
  hospital_id?: number;
}

export interface UpdateMedicalCoderRequest {
  hospital_id?: number;
}