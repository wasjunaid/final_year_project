export interface AssociatedDoctorDto {
  doctor_id: number;
  hospital_id: number;
  specialization?: string | null;
  license_number?: string | null;
  sitting_start?: string | null;
  sitting_end?: string | null;
  doctor_status: string;
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_email: string;
}
