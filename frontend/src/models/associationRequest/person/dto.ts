// DTO returned by backend for person association requests
export interface PersonAssociationRequestDto {
  hospital_association_request_id: number;
  hospital_id: number;
  person_id: number;
  person_first_name?: string;
  person_last_name?: string;
  person_name?: string;
  person_email?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export type PersonAssociationRequestsListDto = PersonAssociationRequestDto[];
