export interface CreateFamilyHistoryPayload {
  condition_name: string;
}

export interface CreateFamilyHistoryForDoctorPayload extends CreateFamilyHistoryPayload {
  patient_id: number;
}
