export interface CreateAllergyPayload {
  allergy_name: string;
}

export interface CreateAllergyForDoctorPayload extends CreateAllergyPayload {
  patient_id: number;
}
