/**
 * Payload for updating medical coder's hospital association
 */
export interface UpdateMedicalCoderHospitalPayload {
  // This endpoint updates the association automatically based on auth token
  // No payload needed - person_id comes from JWT
}

/**
 * Payload for creating a new medical coding entry
 */
export interface CreateMedicalCodingPayload {
  doctorNoteId: number;
  icdCode?: string;
  cptCode?: string;
  modifierCode?: string;
}

/**
 * Payload for updating an existing medical coding entry
 */
export interface UpdateMedicalCodingPayload {
  medicalCodingId: number;
  icdCode?: string;
  cptCode?: string;
  modifierCode?: string;
}
