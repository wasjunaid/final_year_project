export interface Prescription {
  prescription_id: number;
  appointment_id: number;
  medicine_id: number;
  dosage: string;
  instruction: string;
  medicine_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePrescriptionRequest {
  appointment_id: number;
  medicine_id: number;
  dosage: string;
  instruction: string;
}

export interface UpdatePrescriptionRequest {
  prescription_id: number;
  medicine_id: number;
  dosage: string;
  instruction: string;
}
