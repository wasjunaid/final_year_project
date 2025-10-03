export const ROLES = {
  ADMIN: "admin",
  PATIENT: "patient",
  DOCTOR: "doctor",
  MEDICAL_CODER: "medical-coder",
  SUPER_ADMIN: "super admin",
  HOSPITAL_ADMIN: "hospital admin",
  HOSPITAL_SUB_ADMIN: "hospital sub admin",
  HOSPITAL_FRONT_DESK: "hospital front desk",
  HOSPITAL_LAB_TECHNICIAN: "hospital lab technician",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
