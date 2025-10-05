export interface AppointmentRequest {
  appointment_request_id: number;
  patient_id: number;
  hospital_id: number;
  doctor_id: number;
  date: string;
  time: string;
  reason: string;
  appointment_status: AppointmentRequestStatusType;
  cost?: number;
  // Patient info
  patient_first_name: string | null;
  patient_last_name: string | null;
  patient_email: string;
  // Doctor info
  doctor_first_name: string | null;
  doctor_last_name: string | null;
  doctor_email: string;
  specialization: string | null;
  // Hospital info
  hospital_name?: string;
  hospital_address?: string;
}

export const AppointmentRequestStatus = {
  processing: "processing",
  approved: "approved",
  rescheduled: "rescheduled",
  denied: "denied",
  cancelled: "cancelled",
} as const;

export type AppointmentRequestStatusType =
  (typeof AppointmentRequestStatus)[keyof typeof AppointmentRequestStatus];
