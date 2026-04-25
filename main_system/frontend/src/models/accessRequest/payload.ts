export interface CreateAccessRequestPayload {
  requester_id?: number;
  patient_email?: string;
  patient_id?: number;
  document_id?: number | null;
}
