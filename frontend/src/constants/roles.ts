export const ROLES = {
  ADMIN: "admin",
  PATIENT: "patient",
  DOCTOR: "doctor",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
