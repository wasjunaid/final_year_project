// Hospital payloads for API requests

export interface CreateHospitalPayload {
  name: string;
  focal_person_name?: string | null;
  focal_person_email?: string | null;
  focal_person_phone?: string | null;
  address?: string | null;
}

export interface UpdateHospitalPayload {
  name: string;
  wallet_address: string;
  focal_person_name?: string | null;
  focal_person_email?: string | null;
  focal_person_phone?: string | null;
  hospitalization_daily_charge?: number | null;
  address?: string | null;
}
