// User payloads for API requests

export interface CreateSystemSubAdminPayload {
  email: string;
}

export interface CreateHospitalAdminPayload {
  email: string;
  hospital_id: number;
  role: string;
}

export interface UpdateSystemSubAdminStatusPayload {
  is_active: boolean;
}

export interface UserListFiltersPayload {
  search?: string;
  is_active?: boolean;
  is_verified?: boolean;
}
