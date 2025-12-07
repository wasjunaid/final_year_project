export interface PersonDto {
  person_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  cnic: string | null;
  date_of_birth: string | null; // ISO date string
  gender: 'm' | 'f' | 'o' | null;
  is_verified: boolean;
  is_person_profile_complete: boolean;
  profile_picture_url: string | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface AuthDto {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshJwtDto {
  accessToken: string;
  refreshToken: string;
}