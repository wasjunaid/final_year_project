export interface EHRAccess {
  ehr_access_id: number;
  patient_id: number;
  doctor_id: number;
  status: 'PENDING' | 'GRANTED' | 'DENIED' | 'REVOKED';
  granted_at?: string;
  revoked_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Extended fields
  patient_name?: string;
  doctor_name?: string;
}

export interface CreateEHRAccessRequest {
  patient_id: number;
  message?: string;
}
