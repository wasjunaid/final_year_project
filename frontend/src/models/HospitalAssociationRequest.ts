export interface HospitalAssociationRequest {
  hospital_association_request_id: number;
  person_id: number;
  hospital_id: number;
  role: string;
  created_at: string;
  // Extended fields from join queries
  person_name?: string;
  hospital_name?: string;
  person_email?: string;
}

export interface CreateHospitalAssociationRequest {
  email: string;
  role: string;
}
