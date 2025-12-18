import { useState, useCallback } from 'react';
import type { GoogleAuthPayload } from '../../models/auth';
import type { ErrorInfo, SuccessInfo } from '../../models/api';
import { ValidationError } from '../../utils/validations';
import { AppError } from '../../utils/appError';

export const createGoogleAuthController = ({ repository }: { repository: any }) => {
  return () => {
    // Local state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [success, setSuccess] = useState<SuccessInfo | null>(null);

    // Initiate Google OAuth
    const initiateGoogleAuth = useCallback(async (payload: GoogleAuthPayload): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await repository.initiateGoogleAuth(payload);
        
        // If we reach here, the redirect should have happened
        setSuccess({ message: 'Redirecting to Google...' });
        return true;
      } catch (err: any) {
        // Handle AppError instances
        if (err instanceof AppError) {
          console.error('[useGoogleAuth] Google auth AppError:', {
            title: err.title,
            message: err.message,
            subtitle: err.subtitle
          });
          setError({
            title: err.title,
            message: err.message,
            subtitle: err.subtitle
          });
          return false;
        }
        
        // Handle ValidationError
        if (err instanceof ValidationError) {
          setError({ message: err.message, title: 'Validation Error' });
          return false;
        }
        
        // Fallback for unexpected errors
        setError({ message: err?.message || 'An unexpected error occurred', title: 'Google Auth Error' });
        return false;
      } finally {
        setLoading(false);
      }
    }, [repository]);

    // Clear messages
    const clearMessages = useCallback(() => {
      setError(null);
      setSuccess(null);
    }, []);

    return {
      loading,
      error,
      success,
      initiateGoogleAuth,
      clearMessages,
    };
  };
};