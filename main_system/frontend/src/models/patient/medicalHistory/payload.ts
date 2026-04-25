export interface CreateMedicalHistoryPayload {
  condition_name: string;
  diagnosis_date?: string;
}

export interface CreateMedicalHistoryForDoctorPayload extends CreateMedicalHistoryPayload {
  patient_id: number;
}
