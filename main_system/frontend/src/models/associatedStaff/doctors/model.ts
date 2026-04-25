export interface AssociatedDoctorModel {
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
