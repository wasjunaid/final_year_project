export interface EHRAccess {
  ehr_access_id: number;
  doctor_id: number;
  patient_id: number;
  status: EHRAccessStatusType;
  message?: string;
  requested_at?: string;
  responded_at?: string;
  created_at?: string;
  // Extended fields from view
  doctor_name?: string;
  patient_name?: string;
  patient_email?: string;
  doctor_email?: string;
}

export type EHRAccessStatusType = 'PENDING' | 'APPROVED' | 'DENIED' | 'REQUESTED' | 'GRANTED';

export interface CreateEHRAccessRequest {
  patient_id: number;
  message?: string;
}

export interface RespondToEHRAccessRequest {
  status: 'APPROVED' | 'DENIED';
}

export interface EHR {
  ehr_id: number;
  patient_id: number;
  medical_history?: string;
  allergies?: string;
  medications?: string;
  immunizations?: string;
  lab_results?: string;
  family_history?: string;
  social_history?: string;
  vital_signs?: string;
  created_at: string;
  updated_at: string;
  // Extended fields from view
  patient_name?: string;
  patient_email?: string;
  patient_date_of_birth?: string;
  patient_gender?: string;
  patient_blood_group?: string;
}
