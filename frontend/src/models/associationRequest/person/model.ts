// Frontend model for a person association request
export interface PersonAssociationRequestModel {
  hospital_association_request_id: number;
  hospital_id: number;
  person_id: number;
  person_name?: string;
  person_email?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}
