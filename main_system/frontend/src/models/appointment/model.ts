import type { AppointmentStatusType } from './enums';

export interface AppointmentModel {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  hospitalId?: number | null;

  // canonical scheduled timestamp (ISO string) or null
  scheduledAt?: string | null;

  // separate normalized date/time for UI convenience
  date?: string | null; // YYYY-MM-DD
  time?: string | null; // HH:MM:SS

  // display fields
  patientName?: string | null;
  doctorName?: string | null;
  hospitalName?: string | null;

  // numeric costs for calculations
  appointmentCost?: number | null;
  // labTestCost?: number | null;
  // totalCost?: number | null;

  // doctor's note / reason (cleaned)
  notes?: string | null;
  appointmentType?: 'opd' | 'hospitalization' | string | null;
  parentAppointmentId?: number | null;
  followUpNotes?: string | null;
  admissionDate?: string | null;
  dischargeDate?: string | null;

  // clinical fields entered by doctor when completing appointment
  historyOfPresentIllness?: string | null;
  reviewOfSystems?: string | null;
  physicalExam?: string | null;
  diagnosis?: string | null;
  diagnosisList?: string[];
  // transient UI field for adding a single diagnosis (not persisted)
  _newDiagnosis?: string | null;
  plan?: string | null;

  // status (keep as typed union or string)
  status: AppointmentStatusType | string;

  // completion flags & timestamps
  doctorCompleted?: boolean;
  doctorCompletedAt?: string | null;

  // lab test flags
  labTestsOrdered?: boolean;
  labTestsCompleted?: boolean;
  labTestsCompletedAt?: string | null;

  appliedHospitalizationDailyCharge?: number | null;
  hospitalizationTotalCharge?: number | null;

  // labTestRequired?: boolean;
  // labTestCompleted?: boolean;
  // labTestCompletedAt?: string | null;
  // labTestCompletedBy?: number | null;

  // prescriptionRequired?: boolean;
  // prescriptionCompleted?: boolean;
  // prescriptionCompletedAt?: string | null;
  // prescriptionCompletedBy?: number | null;

  isFullyCompleted?: boolean;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AppointmentBookingDoctorModel {
  id: number;
  hospitalId: number;
  specialization?: string | null;
  yearsOfExperience?: number | null;
  licenseNumber?: string | null;
  sittingStart?: string | null;
  sittingEnd?: string | null;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}
