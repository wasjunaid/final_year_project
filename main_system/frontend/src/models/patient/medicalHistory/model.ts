export interface MedicalHistory {
  patientMedicalHistoryId: number;
  patientId: number;
  conditionName: string;
  diagnosisDate?: string | Date;
  createdAt?: Date;
}
