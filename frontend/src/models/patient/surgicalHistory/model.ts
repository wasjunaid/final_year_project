export interface SurgicalHistory {
  patientSurgicalHistoryId: number;
  patientId: number;
  surgeryName: string;
  surgeryDate?: string | Date;
  createdAt?: Date;
}
