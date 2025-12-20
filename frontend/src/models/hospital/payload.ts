// Hospital payloads for API requests

export interface CreateHospitalPayload {
  name: string;
}

export interface UpdateHospitalPayload {
  name: string;
  wallet_address: string;
}
