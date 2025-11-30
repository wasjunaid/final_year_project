export interface Appointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  hospital_id: number;
  date: string;
  time: string;
  reason: string;
  status: string;
  appointment_cost: number;
  lab_test_cost: number;
  total_cost: number;
  doctor_note?: string;
  lab_test_required: boolean;
  prescription_required: boolean;
  lab_test_completed: boolean;
  prescription_completed: boolean;
  doctor_completed: boolean;
  created_at: string;
  updated_at: string;
  
  // New fields for displaying names
  patient_name?: string;
  doctor_name?: string;
  hospital_name?: string;
}

export interface CreateAppointmentRequest {
  patient_id?: number;
  doctor_id: number;
  hospital_id: number;
  date: string;
  time: string;
  reason: string;
}

export interface AppointmentRescheduleRequest {
  doctor_id: number;
  date: string;
  time: string;
  reason?: string;
}

export interface ApproveAppointmentRequest {
  doctor_id: number;
  date: string;
  time: string;
  appointment_cost: number;
}