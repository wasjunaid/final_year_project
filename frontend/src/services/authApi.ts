import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  Auth, 
  SignInRequest, 
  SignUpRequest, 
  RefreshJWTRequest,
  EmailVerificationRequest,
  PasswordResetRequest,
  VerifyEmailRequest,
  ResetPasswordRequest
} from '../models/Auth';

export const authApi = {
  // POST /auth/sign-in
  signIn: async (data: SignInRequest): Promise<ApiResponse<Auth>> => {
    const response = await api.post(EndPoints.auth.signIn, data);
    return response.data;
  },

  // POST /auth/sign-up
  signUp: async (data: SignUpRequest): Promise<ApiResponse<null>> => {
    const response = await api.post(EndPoints.auth.signUp, data);
    return response.data;
  },

  // POST /auth/refresh-jwt
  refreshJWT: async (data: RefreshJWTRequest): Promise<ApiResponse<Auth>> => {
    const response = await api.post(EndPoints.auth.refreshJWT, data);
    return response.data;
  },

  // POST /token/send-email-verification
  sendOrResendEmailVerificationToken: async (data: EmailVerificationRequest): Promise<ApiResponse<null>> => {
    const response = await api.post(EndPoints.auth.sendOrResendEmailVerificationToken, data);
    return response.data;
  },

  // POST /token/send-password-reset
  sendOrResendEmailPasswordResetToken: async (data: PasswordResetRequest): Promise<ApiResponse<null>> => {
    const response = await api.post(EndPoints.auth.sendOrResendEmailPasswordResetToken, data);
    return response.data;
  },

  // POST /token/verify-email
  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResponse<null>> => {
    const response = await api.post(EndPoints.auth.verifyEmail, data);
    return response.data;
  },

  // POST /token/reset-password
  passwordReset: async (data: ResetPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await api.post(EndPoints.auth.passwordReset, data);
    return response.data;
  },
};