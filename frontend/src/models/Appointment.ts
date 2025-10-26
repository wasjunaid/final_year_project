export interface Appointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  hospital_id: number;
  date: string;
  time: string;
  reason: string;
  status: 'PROCESSING' | 'APPROVED' | 'DENIED' | 'CANCELLED' | 'RESCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  appointment_cost: number;
  lab_test_cost: number;
  total_cost: number;
  doctor_note?: string;
  doctor_completed: boolean;
  doctor_completed_at?: string;
  lab_test_required: boolean;
  lab_test_completed: boolean;
  lab_test_completed_at?: string;
  lab_test_completed_by?: number;
  prescription_required: boolean;
  prescription_completed: boolean;
  prescription_completed_at?: string;
  prescription_completed_by?: number;
  is_fully_completed: boolean;
  created_at: string;
  updated_at: string;
  // Extended fields from view
  patient_name?: string;
  doctor_name?: string;
  hospital_name?: string;
}

export interface CreateAppointmentRequest {
  doctor_id: number;
  hospital_id: number;
  date: string;
  time: string;
  reason: string;
}

export interface AppointmentRescheduleRequest {
  appointment_id: number;
  date: string;
  time: string;
  reason?: string;
}