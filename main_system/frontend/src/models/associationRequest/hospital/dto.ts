// DTO returned by backend for hospital association requests
export interface HospitalAssociationRequestDto {
  hospital_association_request_id: number;
  hospital_id: number;
  person_id: number;
  person_first_name?: string;
  person_last_name?: string;
  person_name?: string;
  person_email?: string;
  person_full_name?: string;
  hospital_name?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export type HospitalAssociationRequestsListDto = HospitalAssociationRequestDto[];
