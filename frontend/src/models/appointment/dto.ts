export interface AppointmentDTO {
  id: string;
  title: string;
  starts_at: string; // ISO string from backend
  patient?: { id: string; name: string } | null;
}