// DTOs match backend response structure exactly
export interface LogDto {
  log_id: number;
  person_id: number;
  action: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}
