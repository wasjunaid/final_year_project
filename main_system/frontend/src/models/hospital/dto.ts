// Hospital DTOs matching backend response structure

export interface HospitalDto {
  hospital_id: number;
  name: string;
  focal_person_name?: string | null;
  focal_person_email?: string | null;
  focal_person_phone?: string | null;
  address?: string | null;
  wallet_address: string;
  created_at: string;
  updated_at: string;
  hospitalization_daily_charge?: number | null;
}

export interface HospitalsListDto {
  hospitals: HospitalDto[];
}
