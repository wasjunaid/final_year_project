export interface SurgicalHistoryDto {
  patient_surgical_history_id: number;
  patient_id: number;
  surgery_name: string;
  surgery_date?: string;
  created_at?: string;
}
