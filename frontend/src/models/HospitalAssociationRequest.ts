export interface HospitalAssociationRequest {
  hospital_association_request_id: number;
  person_id: number;
  hospital_id: number;
  role: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  created_at: string;
  updated_at: string;
  // Extended fields
  person_name?: string;
  hospital_name?: string;
  person_email?: string;
}

export interface CreateHospitalAssociationRequest {
  hospital_id: number;
  role: string;
  message?: string;
}
