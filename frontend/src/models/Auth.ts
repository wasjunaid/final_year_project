export interface Auth {
  accessToken: string;
  refreshToken: string;
  role: string;
  person_id: number;
}

export interface SignInRequest {
  email: string;
  password: string;
  role: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  role: string;
}

export interface RefreshJWTRequest {
  refreshJWT: string;
}

export interface EmailVerificationRequest {
  email: string;
  role: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}