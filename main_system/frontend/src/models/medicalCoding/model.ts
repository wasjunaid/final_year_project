export interface AppointmentICDModel {
  appointmentId: number;
  code: string;
  description?: string | null;
  createdAt?: string | null;
}

export interface AppointmentCPTModel {
  appointmentId: number;
  code: string;
  description?: string | null;
  createdAt?: string | null;
}
