export interface Person {
  person_id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  cnic?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  address_id?: number;
  address?: string;
  contact_id?: number;
  country_code?: string;
  number?: string;
  is_verified: boolean;
  is_person_profile_complete: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePersonRequest {
  first_name?: string;
  last_name?: string;
  cnic?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  address?: string;
  country_code?: string;
  number?: string;
}