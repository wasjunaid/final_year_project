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