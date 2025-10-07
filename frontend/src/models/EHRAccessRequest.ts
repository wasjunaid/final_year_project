export interface EHRAccessRequest {
  ehr_access_request_id: number;
  patient_id: number;
  doctor_id: number;
  status: "requested" | "approved" | "denied" | "revoked" | "re-requested";
  created_at: string;
  updated_at: string;
  // Joined data
  doctor_first_name?: string;
  doctor_last_name?: string;
  doctor_email?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_email?: string;
}
