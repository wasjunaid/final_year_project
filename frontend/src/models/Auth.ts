// Generated: Auth feature — follow DI + repository + zustand factory pattern

/**
 * Raw DTO from backend API for authentication responses
 */
export interface AuthDto {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: 'doctor' | 'patient' | 'admin';
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * App-friendly model for authenticated user
 */
export interface AuthModel {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: 'doctor' | 'patient' | 'admin';
    firstName: string;
    lastName: string;
    fullName: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Login request payload
 */
export interface LoginPayload {
  email: string;
  password: string;
  role: 'doctor' | 'patient' | 'admin';
}

/**
 * Signup request payload
 */
export interface SignupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'doctor' | 'patient' | 'admin';
}

/**
 * User role type
 */
export type UserRole = 'doctor' | 'patient' | 'admin';
