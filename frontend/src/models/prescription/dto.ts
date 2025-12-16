export interface PrescriptionDto {
  prescription_id: number;
  appointment_id: number;
  medicine_id: number;
  dosage: string;
  instruction: string;
  prescription_date?: string | null;
  is_current?: boolean | null;
  // Optional fields that may be included by backend
  medicine_name?: string | null;
  patient_id?: number | null;
  patient_name?: string | null;
  doctor_name?: string | null;
}

export type PrescriptionListDto = PrescriptionDto[];

export interface CreatePrescriptionPayload {
  appointment_id: number;
  medicine_id: number;
  dosage: string;
  instruction: string;
  prescription_date?: string;
}
