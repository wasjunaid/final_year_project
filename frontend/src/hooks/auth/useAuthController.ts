import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { useProfileStore, type ProfileState } from '../../stores/profile';
import type { AuthRepository } from '../../repositories/auth';
import { ValidationError } from '../../utils/validations';
import { AppError } from '../../utils/appError';
import type { SignInPayload, SignUpPayload } from '../../models/auth';
import type { ErrorInfo, SuccessInfo } from '../../models/api';
import ROUTES from '../../constants/routes';
import { ROLES, type UserRole } from '../../constants/profile';

export const createAuthController = ({ repository }: { repository: AuthRepository }) => {
  return () => {
    const navigate = useNavigate();
  
  // Store state
  const {
    isAuthenticated,
    role,
    personId,
    accessToken,
    refreshToken,
    initialized,
    setAuth,
    clearAuth,
  } = useAuthStore();

  // Profile store
  const profileData = useProfileStore((state: ProfileState) => state.profile);
  const clearProfile = useProfileStore((state: ProfileState) => state.clearProfile);

  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);
  const [emailVerificationNeeded, setEmailVerificationNeeded] = useState(false);

  // Sign in user
  const signIn = useCallback(async (payload: SignInPayload, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setEmailVerificationNeeded(false);

      const authModel = await repository.signIn(payload, rememberMe);
      
      // Validate that we got valid auth data
      if (!authModel.accessToken || !authModel.refreshToken) {
        throw new Error('Invalid response: Missing authentication tokens');
      }
      
      if (!authModel.role || !authModel.personId) {
        throw new Error('Invalid token: Could not extract user information');
      }
      
      setAuth({
        accessToken: authModel.accessToken,
        refreshToken: authModel.refreshToken,
      });

      setSuccess({ message: 'Successfully signed in' });
      return true;
    } catch (err: any) {
      // Handle AppError instances
      if (err instanceof AppError) {
        console.error('[useAuth] Sign in AppError:', {
          title: err.title,
          message: err.message,
          subtitle: err.subtitle,
          emailVerificationNeeded: (err as any).emailVerificationNeeded
        });
        setError({
          title: err.title,
          message: err.message,
          subtitle: err.subtitle
        });
        
        // Check for email verification needed
        if ((err as any).emailVerificationNeeded === true) {
          setEmailVerificationNeeded(true);
        }
        
        return false;
      }
      
      // Handle ValidationError
      if (err instanceof ValidationError) {
        setError({ message: err.message, title: 'Validation Error' });
        return false;
      }
      
      // Fallback for unexpected errors
      setError({ message: err?.message || 'An unexpected error occurred', title: 'Error' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);  // any variable used inside the callback should be added to dependency array Example: setAuth

  // Sign up user
  const signUp = useCallback(async (payload: SignUpPayload): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await repository.signUp(payload);
      
      // Don't auto sign in - user must verify email first
      setSuccess({ 
        message: 'Account created successfully! Please check your email to verify your account.',
        subtitle: 'You can now sign in to your account.'
      });
      return true;
    } catch (err: any) {
      // Handle AppError instances
      if (err instanceof AppError) {
        console.error('[useAuth] Sign up AppError:', {
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
      setError({ message: err?.message || 'Failed to create account', title: 'Error' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out user
  const signOut = useCallback(() => {
    // Clear authentication and storage
    clearAuth();
    // Clear profile data
    clearProfile();
    
    setSuccess({ message: 'Successfully signed out' });
    navigate(ROUTES.AUTH.SIGN_IN);
  }, [clearAuth, clearProfile, navigate]);

  // Send or resend email verification token
  const sendEmailVerification = useCallback(async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await repository.sendEmailVerificationToken({ email });
      
      setSuccess({ message: 'Verification email sent! Please check your inbox.' });
      return true;
    } catch (err: any) {
      if (err instanceof AppError) {
        console.error('[useAuth] Send email verification AppError:', {
          title: err.title,
          message: err.message,
          subtitle: err.subtitle
        });
        setError({
          title: err.title,
          message: err.message,
          subtitle: err.subtitle
        });
      } else {
        console.error('[useAuth] Send email verification error:', err);
        setError({ message: err?.message || 'Failed to send verification email', title: 'Error' });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify email with token
  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await repository.verifyEmail({ token });
      
      setSuccess({ message: 'Email verified successfully! You can now sign in.' });
      return true;
    } catch (err: any) {
      if (err instanceof AppError) {
        console.error('[useAuth] Verify email AppError:', {
          title: err.title,
          message: err.message,
          subtitle: err.subtitle
        });
        setError({
          title: err.title,
          message: err.message,
          subtitle: err.subtitle
        });
      } else {
        console.error('[useAuth] Verify email error:', err);
        setError({ message: err?.message || 'Failed to verify email', title: 'Error' });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send password reset token
  const sendPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await repository.sendPasswordResetToken({ email });
      
      setSuccess({ message: 'Password reset email sent! Please check your inbox.' });
      return true;
    } catch (err: any) {
      if (err instanceof AppError) {
        console.error('[useAuth] Send password reset AppError:', {
          title: err.title,
          message: err.message,
          subtitle: err.subtitle
        });
        setError({
          title: err.title,
          message: err.message,
          subtitle: err.subtitle
        });
      } else {
        console.error('[useAuth] Send password reset error:', err);
        setError({ message: err?.message || 'Failed to send password reset email', title: 'Error' });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password with token
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await repository.resetPassword({ token, password: newPassword });
      
      setSuccess({ message: 'Password reset successfully! You can now sign in.' });
      return true;
    } catch (err: any) {
      if (err instanceof AppError) {
        console.error('[useAuth] Reset password AppError:', {
          title: err.title,
          message: err.message,
          subtitle: err.subtitle
        });
        setError({
          title: err.title,
          message: err.message,
          subtitle: err.subtitle
        });
      } else {
        console.error('[useAuth] Reset password error:', err);
        setError({ message: err?.message || 'Failed to reset password', title: 'Error' });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
    setEmailVerificationNeeded(false);
  }, []);

  // Check if user has a specific role
  const hasRole = useCallback((checkRole: UserRole): boolean => {
    return role === checkRole;
  }, [role]);

  //Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return role ? roles.includes(role) : false;
  }, [role]);

  //Navigate to role-specific portal
  const navigateToPortal = useCallback(() => {
    if (!role) {
      console.warn('Cannot navigate to portal: user role is undefined');
      return;
    }

    // Map all roles to their corresponding portals
    const portalRoutes: Partial<Record<UserRole, string>> = {
      [ROLES.DOCTOR]: ROUTES.DOCTOR_PORTAL,
      [ROLES.PATIENT]: ROUTES.PATIENT_PORTAL,
      [ROLES.SYSTEM_ADMIN]: ROUTES.SYSTEM_ADMIN_PORTAL,
      [ROLES.SYSTEM_SUB_ADMIN]: ROUTES.SYSTEM_ADMIN_PORTAL,
      [ROLES.MEDICAL_CODER]: ROUTES.MEDICAL_CODER_PORTAL,
      [ROLES.HOSPITAL_ADMIN]: ROUTES.HOSPITAL_PORTAL,
      [ROLES.HOSPITAL_SUB_ADMIN]: ROUTES.HOSPITAL_PORTAL,
      [ROLES.HOSPITAL_FRONT_DESK]: ROUTES.FRONT_DESK_PORTAL,
      [ROLES.HOSPITAL_LAB_TECHNICIAN]: ROUTES.LAB_TECHNICIAN_PORTAL,
      [ROLES.HOSPITAL_PHARMACIST]: ROUTES.PHARMACIST_PORTAL,
    };

    const route = portalRoutes[role];
    if (route) {
      navigate(route);
    } else {
      // Fallback for roles without portals
      console.warn(`No portal route defined for role: ${role}`);
      navigate(ROUTES.HOME);
    }
  }, [role, navigate]);

  // // Auto-clear messages after 5 seconds
  // useEffect(() => {
  //   if (success || error) {
  //     const timer = setTimeout(() => {
  //       setError('');
  //       setSuccess('');
  //       setEmailVerificationNeeded(false);
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [success, error]);
  return {
    // State
    isAuthenticated,
    role,
    personId,
    accessToken,
    refreshToken,
    initialized,
    loading,
    error,
    success,
    emailVerificationNeeded,
    profileData,

    // Actions
    signIn,
    signUp,
    signOut,
    sendEmailVerification,
    verifyEmail,
    sendPasswordReset,
    resetPassword,
    clearMessages,

    // Utilities
    hasRole,
    hasAnyRole,
    navigateToPortal,
  };
}
}
