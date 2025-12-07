// User payloads for API requests

export interface CreateSystemSubAdminPayload {
  email: string;
}

export interface CreateHospitalAdminPayload {
  email: string;
  hospital_id: number;
  role: string;
}
