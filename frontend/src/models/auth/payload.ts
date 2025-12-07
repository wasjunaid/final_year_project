import type { UserRole } from "../auth";

export interface SignInPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface SignUpPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface EmailVerificationTokenPayload {
  email: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface PasswordResetTokenPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}
