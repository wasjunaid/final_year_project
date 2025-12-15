export interface MedicalHistoryDto {
  patient_medical_history_id: number;
  patient_id: number;
  condition_name: string;
  diagnosis_date?: string;
  created_at?: string;
}
