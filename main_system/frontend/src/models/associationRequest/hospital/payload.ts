// Payload for creating a hospital association request
export interface CreateHospitalAssociationRequestPayload {
  email: string;
  role: string; // 'doctor' | 'medical_coder'
}
