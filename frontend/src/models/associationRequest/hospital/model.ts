// Frontend model for a hospital association request
export interface HospitalAssociationRequestModel {
  hospital_association_request_id: number;
  hospital_id: number;
  person_id: number;
  person_name?: string;
  person_email?: string;
  hospitalName?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}
