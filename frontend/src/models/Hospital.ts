export interface Hospital {
  hospital_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHospitalRequest {
  name: string;
}

export interface UpdateHospitalRequest {
  hospital_id: number;
  name: string;
}