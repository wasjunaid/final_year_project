export interface AppointmentDto {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  hospital_id?: number | null;

  // backend may return full ISO or just YYYY-MM-DD
  date?: string | null; // e.g. "2025-12-10T19:00:00.000Z" or "2025-12-10"
  time?: string | null; // e.g. "20:00:00"

  reason?: string | null;
  appointment_type?: 'opd' | 'hospitalization' | string | null;
  parent_appointment_id?: number | null;
  follow_up_notes?: string | null;
  admission_date?: string | null;
  discharge_date?: string | null;
  doctor_note?: string | null;
  history_of_present_illness?: string | null;
  review_of_systems?: string | null;
  physical_exam?: string | null;
  diagnosis?: string | null;
  plan?: string | null;

  status: string;

  appointment_cost?: string | number | null;
  // lab_test_cost?: string | number | null;
  // total_cost?: string | number | null;

  doctor_completed?: boolean | null;
  doctor_completed_at?: string | null;

  // lab_test_required?: boolean | null;
  // lab_test_completed?: boolean | null;
  // lab_test_completed_at?: string | null;
  // lab_test_completed_by?: number | null;

  // prescription_required?: boolean | null;
  // prescription_completed?: boolean | null;
  // prescription_completed_at?: string | null;
  // prescription_completed_by?: number | null;

  is_fully_completed?: boolean | null;

  created_at?: string | null;
  updated_at?: string | null;

  // optional display names included by backend
  patient_name?: string | null;
  doctor_name?: string | null;
  hospital_name?: string | null;
}

export interface AppointmentBookingDoctorDto {
  doctor_id: number;
  hospital_id: number;
  specialization?: string | null;
  years_of_experience?: number | null;
  license_number?: string | null;
  sitting_start?: string | null;
  sitting_end?: string | null;
  doctor_status: string;
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_email: string;
}
