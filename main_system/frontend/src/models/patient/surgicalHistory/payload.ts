export interface CreateSurgicalHistoryPayload {
  surgery_name: string;
  surgery_date?: string;
}

export interface CreateSurgicalHistoryForDoctorPayload extends CreateSurgicalHistoryPayload {
  patient_id: number;
}
