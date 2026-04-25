export interface PrescriptionModel {
  prescriptionId: number;
  appointmentId: number;
  medicineId: number;
  dosage: string;
  instruction: string;
  prescriptionDate?: string | null;
  isCurrent?: boolean | null;
  // Optional fields
  medicineName?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  doctorName?: string | null;
}

export type PrescriptionList = PrescriptionModel[];
