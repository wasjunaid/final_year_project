import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { AuthDto } from '../../models/auth/dto';
import type {
  SignInPayload,
  SignUpPayload,
  EmailVerificationTokenPayload,
  VerifyEmailPayload,
  PasswordResetTokenPayload,
  ResetPasswordPayload,
} from '../../models/auth/payload';

// Auth service - pure HTTP helpers returning DTOs wrapped in ApiResponse
export const authService = {
  // Sign in user - POST /auth/sign-in
  async signIn(payload: SignInPayload): Promise<ApiResponse<AuthDto>> {
    const response = await apiClient.post<ApiResponse<AuthDto>>('/auth/sign-in', payload);
    return response.data;
  },

  // Sign up new user - POST /auth/sign-up
  async signUp(payload: SignUpPayload): Promise<ApiResponse<AuthDto>> {
    const response = await apiClient.post<ApiResponse<AuthDto>>('/auth/sign-up', payload);
    return response.data;
  },

  // Send or resend email verification token - POST /token/send-email-verification
  async sendEmailVerificationToken(payload: EmailVerificationTokenPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/token/send-email-verification', payload);
    return response.data;
  },

  // Verify email with token - POST /token/verify-email
  async verifyEmail(payload: VerifyEmailPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/token/verify-email', payload);
    return response.data;
  },

  // Send password reset token - POST /token/send-password-reset-token
  async sendPasswordResetToken(payload: PasswordResetTokenPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/token/send-password-reset', payload);
    return response.data;
  },

  // Reset password with token - POST /token/reset-password
  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/token/reset-password', payload);
    return response.data;
  },
};
