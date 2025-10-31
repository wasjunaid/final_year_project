
export interface Prescription {
  prescription_id: number;
  appointment_id: number;
  medicine_id: number;
  dosage: string;
  instruction: string;
  created_at: string;
  updated_at: string;
  // Extended fields
  medicine_name?: string;
  appointment_date?: string;
  patient_name?: string;
  doctor_name?: string;
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
