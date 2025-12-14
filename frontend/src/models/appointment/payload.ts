// Payload for creating an appointment
export interface CreateAppointmentPayload {
  patient_id?: number;
  doctor_id: number;
  date?: string | null;        // YYYY-MM-DD
  time?: string | null;        // HH:MM
  scheduled_at?: string | null; // ISO string
  reason?: string | null;       // maps to notes
  hospital_id?: number | null;
}

// Payload for approving an appointment (doctor/hospital may add extra info)
export interface ApproveAppointmentPayload {
  doctor_note?: string | null;
}

// Payload for rescheduling an appointment by patient
export interface PatientRescheduleAppointmentPayload {
  doctor_id: number;           // Required
  date: string;                // Required: YYYY-MM-DD
  time: string;                // Required: HH:MM:SS or HH:MM
  reason: string;              // Required: reason for rescheduling
}

// Payload for rescheduling an appointment by hospital staff
export interface HospitalRescheduleAppointmentPayload {
  doctor_id: number;           // Required
  date: string;                // Required: YYYY-MM-DD
  time: string;                // Required: HH:MM:SS or HH:MM
}

// Payload for completing an appointment by doctor
export interface CompleteDoctorPayload {
  doctor_note?: string | null;
  history_of_present_illness?: string | null;
  review_of_systems?: string | null;
  physical_exam?: string | null;
  diagnosis?: string | null;
  plan?: string | null;
  lab_tests_ordered?: boolean;
}

// Payload for starting an appointment (could be extended later)
export interface StartAppointmentPayload {
  // currently empty but can include location, initial vitals, etc.
}