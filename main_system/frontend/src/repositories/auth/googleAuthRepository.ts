import type { GoogleAuthPayload } from '../../models/auth/payload';
import { validators } from '../../utils/validations';
import { AppError } from '../../utils/appError';

// Factory to create Google auth repository with DI for service - enables testing with mock services
export const createGoogleAuthRepository = ({ googleAuthService }: { googleAuthService: any }) => {
  return {
    // Initiate Google OAuth and redirect user
    async initiateGoogleAuth(payload: GoogleAuthPayload): Promise<void> {
      validators.role(payload.role);

      try {
        // Store the selected role in sessionStorage for after callback
        sessionStorage.setItem('google-auth-role', payload.role);

        // Redirect to Google OAuth (this will redirect the entire page)
        await googleAuthService.initiateGoogleAuth(payload);
      } catch (error: any) {
        // If it's already an AppError, just throw it
        if (error instanceof AppError) {
          throw error;
        }
        
        // Handle network or other errors
        throw new AppError({
          message: error.message || 'Failed to initiate Google authentication',
          title: 'Google Auth Error'
        });
      }
    },
  };
};