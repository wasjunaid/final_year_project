export interface SystemAdmin {
  system_admin_id: number;
  person_id: number;
  created_at: string;
  updated_at: string;
  // Extended fields from person
  first_name?: string;
  last_name?: string;
  email?: string;
  person_name?: string;
}

export interface CreateSystemAdminRequest {
  person_id: number;
}
