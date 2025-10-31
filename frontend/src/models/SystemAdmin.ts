export interface SystemAdmin {
  system_admin_id: number;
  person_id: number;
  created_at: string;
  // Extended fields from person table joins
  first_name?: string;
  last_name?: string;
  email?: string;
  person_name?: string;
}

export interface CreateSystemAdminRequest {
  email: string;
}
