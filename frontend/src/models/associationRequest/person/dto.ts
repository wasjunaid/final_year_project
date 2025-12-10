// DTO returned by backend for person association requests
export interface PersonAssociationRequestDto {
  hospital_association_request_id: number;
  hospital_id: number;
  person_id: number;
  created_at?: string;
}

export type PersonAssociationRequestsListDto = PersonAssociationRequestDto[];
