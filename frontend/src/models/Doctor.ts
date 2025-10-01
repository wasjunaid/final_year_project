export interface Doctor {
  doctor_id: number;
  license_number: string;
  specialization: string;
  years_of_experience: number;
  sitting_start?: string;
  sitting_end?: string;
}
