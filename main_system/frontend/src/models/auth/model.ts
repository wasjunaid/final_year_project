import type { UserRole } from "../../constants/profile";

export interface UserModel {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string; // Computed: firstName + lastName or email fallback
  cnic: string | null;
  dateOfBirth: Date | null;
  age: number | null; // Computed from dateOfBirth
  gender: 'm' | 'f' | 'o' | null;
  isVerified: boolean;
  isProfileComplete: boolean;
  profilePictureUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
  
export interface AuthModel {
  accessToken: string;
  refreshToken: string;
  role: UserRole | null;
  personId: string | null;
}

export interface AuthSessionModel {
  auth: AuthModel;
  user?: UserModel;
}
