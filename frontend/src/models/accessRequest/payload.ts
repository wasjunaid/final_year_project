export interface CreateAccessRequestPayload {
  requester_id: number;
  patient_email: string;
  document_id?: number | null;
}
