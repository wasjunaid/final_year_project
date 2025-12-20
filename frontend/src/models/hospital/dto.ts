// Hospital DTOs matching backend response structure

export interface HospitalDto {
  hospital_id: number;
  name: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

export interface HospitalsListDto {
  hospitals: HospitalDto[];
}
