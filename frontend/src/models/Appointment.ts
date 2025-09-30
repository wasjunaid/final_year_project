export interface Appointment {
  appointment_id: number;
  status: string;
  cost: number;

  // formatted by backend as strings
  date: string; // e.g. "2025-10-01"
  time: string; // e.g. "14:30"
  reason: string;

  created_at: string;
  updated_at: string;

  // patient info (sometimes optional depending on endpoint)
  patient_id?: number;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_email?: string;

  // doctor info
  doctor_id?: number;
  doctor_first_name?: string;
  doctor_last_name?: string;
  doctor_email?: string;
  specialization?: string; // available in EHR response

  // hospital info
  hospital_id?: number;
  hospital_name?: string;
  hospital_address?: string;

  // doctor note (EHR response only)
  doctor_note?: string;
}
