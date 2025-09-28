export const ROLES = {
  ADMIN: "admin",
  PATIENT: "patient",
  DOCTOR: "doctor",
  HOSPITAL: "hospital",
  FRONT_DESK: "front-desk",
  MEDICAL_CODER: "medical-coder",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
