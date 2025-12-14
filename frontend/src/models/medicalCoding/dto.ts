export interface AppointmentICDDto {
  appointment_id: number;
  icd_code: string;
  description?: string | null;
  created_at?: string | null;
}

export interface AppointmentCPTDto {
  appointment_id: number;
  cpt_code: string;
  description?: string | null;
  created_at?: string | null;
}
