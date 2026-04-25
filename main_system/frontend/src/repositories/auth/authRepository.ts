import type { AuthModel } from '../../models/auth/model';
import type {
  SignInPayload,
  SignUpPayload,
  EmailVerificationTokenPayload,
  VerifyEmailPayload,
  PasswordResetTokenPayload,
  ResetPasswordPayload,
} from '../../models/auth/payload';
import { validators } from '../../utils/validations';
import { transformAuthDto } from '../../models/auth/transformers';
import { AppError } from '../../utils/appError';

// Factory to create auth repository with DI for service - enables testing with mock services
export const createAuthRepository = ({ authService }: { authService: any }) => {
  return {
    // Sign in user
    async signIn(payload: SignInPayload, rememberMe: boolean = false): Promise<AuthModel> {
      validators.email(payload.email);
      validators.password(payload.password);
      validators.role(payload.role);

      try {
        // Store rememberMe preference before making the request
        localStorage.setItem('auth-remember-me', rememberMe.toString());

        const response = await authService.signIn(payload);

        if (!response.success) {
          const error = new AppError({
            message: 'Invalid credentials, try again.',
            title: 'Authentication Failed'
          });
          console.error('[Auth Repository] Sign in failed:', { email: payload.email, role: payload.role });
          throw error;
        }

        return transformAuthDto(response.data);
      } catch (error: any) {
        // If it's already an AppError, just throw it
        if (error instanceof AppError) {
          throw error;
        }
        
        // Check if it's an axios error with a response
        if (error.response?.data) {
          const errorData = error.response.data;
          
          // Check for email verification needed
          if (errorData.emailVerificationNeeded) {
            const verificationError = new AppError({
              message: 'Please verify your email before signing in.',
              title: 'Email Verification Required',
              subtitle: 'Check your inbox for the verification link'
            });
            (verificationError as any).emailVerificationNeeded = true;
            console.error('[Auth Repository] Email verification required:', { email: payload.email });
            throw verificationError;
          }
          
          // Map generic backend messages
          if (errorData.message?.includes('Unable to Sign In')) {
            const authError = new AppError({
              message: 'Invalid credentials, try again.',
              title: 'Authentication Failed'
            });
            console.error('[Auth Repository] Sign in failed:', { email: payload.email, role: payload.role });
            throw authError;
          }
          
          console.error('[Auth Repository] Sign in error:', errorData.message);
          throw new AppError({ message: errorData.message || 'Sign in failed', title: 'Sign In Failed' });
        }
        
        console.error('[Auth Repository] Unexpected sign in error:', error);
        throw error;
      }
    },

  // Sign up new user - returns void as email verification is required before tokens are issued
  async signUp(payload: SignUpPayload): Promise<void> {
    validators.email(payload.email);
    validators.password(payload.password);
    validators.role(payload.role);

      try {
        const response = await authService.signUp(payload);

        if (!response.success) {
          const error = new AppError({
            message: 'An account with this email already exists.',
            title: 'Account Already Exists',
            subtitle: 'Please sign in instead'
          });
          console.error('[Auth Repository] Account already exists:', { email: payload.email });
          throw error;
        }      // No tokens returned - user must verify email first
    } catch (error: any) {
      // If it's already an AppError, just throw it
      if (error instanceof AppError) {
        throw error;
      }
      
      // Check if it's an axios error with a response
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.message?.toLowerCase().includes('already exists')) {
          const existsError = new AppError({
            message: 'An account with this email already exists.',
            title: 'Account Already Exists',
            subtitle: 'Please sign in instead'
          });
          console.error('[Auth Repository] Account already exists:', { email: payload.email });
          throw existsError;
        }
        
        console.error('[Auth Repository] Sign up error:', errorData.message);
        throw new AppError({ message: errorData.message || 'Sign up failed', title: 'Sign Up Failed' });
      }
      
      console.error('[Auth Repository] Unexpected sign up error:', error);
      throw error;
    }
  },

  // Send or resend email verification token
  async sendEmailVerificationToken(payload: EmailVerificationTokenPayload): Promise<void> {
    validators.email(payload.email);

    const response = await authService.sendEmailVerificationToken(payload);

    if (!response.success) {
      console.error('[Auth Repository] Failed to send verification email:', { email: payload.email });
      throw new AppError({ message: response.message || 'Failed to send verification email', title: 'Email Verification Failed' });
    }
  },

  // Verify email with token
  async verifyEmail(payload: VerifyEmailPayload): Promise<void> {
    if (!payload.token) {
      console.error('[Auth Repository] Email verification token is required');
      throw new AppError({ message: 'Email verification token is required', title: 'Missing Token' });
    }
    
    try {
      const response = await authService.verifyEmail(payload);

      if (!response.success) {
        const errorMessage = response.message || 'Email verification failed';
        
        if (errorMessage.toLowerCase().includes('expired')) {
          console.error('[Auth Repository] Email verification token expired');
          throw new AppError({ message: 'Email verification token has expired. Please request a new one.', title: 'Expired Token' });
        } else if (errorMessage.toLowerCase().includes('invalid') || 
                   errorMessage.toLowerCase().includes('incorrect')) {
          console.error('[Auth Repository] Invalid email verification token');
          throw new AppError({ message: 'Invalid email verification token. Please check the link and try again.', title: 'Invalid Token' });
        } else if (errorMessage.toLowerCase().includes('not found')) {
          console.error('[Auth Repository] Email verification token not found');
          throw new AppError({ message: 'Email verification token not found. It may have already been used.', title: 'Token Not Found' });
        } else {
          console.error('[Auth Repository] Email verification failed:', errorMessage);
          throw new AppError({ message: errorMessage, title: 'Email Verification Failed' });
        }
      }
    } catch (error: any) {
      // If it's already an AppError, just throw it
      if (error instanceof AppError) {
        throw error;
      }
      
      // Handle axios errors
      if (error.response?.data) {
        const errorData = error.response.data;
        const message = errorData.message || 'Email verification failed';
        
        if (message.toLowerCase().includes('expired')) {
          console.error('[Auth Repository] Email verification token expired');
          throw new AppError({ message: 'Email verification token has expired. Please request a new one.', title: 'Expired Token' });
        } else if (message.toLowerCase().includes('invalid') || 
                   message.toLowerCase().includes('incorrect')) {
          console.error('[Auth Repository] Invalid email verification token');
          throw new AppError({ message: 'Invalid email verification token. Please check the link and try again.', title: 'Invalid Token' });
        } else if (message.toLowerCase().includes('not found')) {
          console.error('[Auth Repository] Email verification token not found');
          throw new AppError({ message: 'Email verification token not found. It may have already been used.', title: 'Token Not Found' });
        } else {
          console.error('[Auth Repository] Email verification error:', message);
          throw new AppError({ message: message, title: 'Email Verification Failed' });
        }
      }
      
      throw error;
    }
  },

  // Send password reset token
  async sendPasswordResetToken(payload: PasswordResetTokenPayload): Promise<void> {
    validators.email(payload.email);

    const response = await authService.sendPasswordResetToken(payload);

    if (!response.success) {
      console.error('[Auth Repository] Failed to send password reset email:', { email: payload.email });
      throw new AppError({ message: response.message || 'Failed to send password reset email', title: 'Password Reset Failed' });
    }
  },

  // Reset password with token
  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    validators.token(payload.token);
    validators.password(payload.password);

    try {
      const response = await authService.resetPassword(payload);

      if (!response.success) {
        const errorMessage = response.message || 'Password reset failed';
        
        if (errorMessage.toLowerCase().includes('expired')) {
          console.error('[Auth Repository] Password reset token expired');
          throw new AppError({ message: 'Password reset token has expired. Please request a new one.', title: 'Expired Token' });
        } else if (errorMessage.toLowerCase().includes('invalid')) {
          console.error('[Auth Repository] Invalid password reset token');
          throw new AppError({ message: 'Invalid password reset token. Please check the link and try again.', title: 'Invalid Token' });
        } else {
          console.error('[Auth Repository] Password reset failed:', errorMessage);
          throw new AppError({ message: errorMessage, title: 'Password Reset Failed' });
        }
      }
    } catch (error: any) {
      // If it's already an AppError, just throw it
      if (error instanceof AppError) {
        throw error;
      }
      
      // Handle axios errors
      if (error.response?.data) {
        const errorData = error.response.data;
        const message = errorData.message || 'Password reset failed';
        
        if (message.toLowerCase().includes('expired')) {
          console.error('[Auth Repository] Password reset token expired');
          throw new AppError({ message: 'Password reset token has expired. Please request a new one.', title: 'Expired Token' });
        } else if (message.toLowerCase().includes('invalid')) {
          console.error('[Auth Repository] Invalid password reset token');
          throw new AppError({ message: 'Invalid password reset token. Please check the link and try again.', title: 'Invalid Token' });
        } else {
          console.error('[Auth Repository] Password reset error:', message);
          throw new AppError({ message: message, title: 'Password Reset Failed' });
        }
      }
      
      throw error;
    }
  },
  };
};

export type AuthRepository = ReturnType<typeof createAuthRepository>;

