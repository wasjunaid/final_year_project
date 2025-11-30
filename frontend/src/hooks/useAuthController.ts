// Generated: Auth feature — follow DI + repository + zustand factory pattern

import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.prod';
import type { LoginPayload, SignupPayload } from '../models/auth';

/**
 * Auth controller hook - provides authentication actions and state
 * Auto-verifies token on mount if available
 */
export function useAuthController() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginAction = useAuthStore((state) => state.login);
  const signupAction = useAuthStore((state) => state.signup);
  const logoutAction = useAuthStore((state) => state.logout);
  const verifyTokenAction = useAuthStore((state) => state.verifyToken);
  const clearErrorAction = useAuthStore((state) => state.clearError);

  // Auto-verify token on mount if token exists but user not loaded
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user && !loading) {
      verifyTokenAction();
    }
  }, []); // Only run once on mount

  /**
   * Login wrapper
   */
  const login = async (payload: LoginPayload) => {
    await loginAction(payload);
  };

  /**
   * Signup wrapper
   */
  const signup = async (payload: SignupPayload) => {
    await signupAction(payload);
  };

  /**
   * Logout wrapper
   */
  const logout = async () => {
    await logoutAction();
  };

  /**
   * Clear error
   */
  const clearError = () => {
    clearErrorAction();
  };

  /**
   * Get user role for navigation
   */
  const getUserRole = () => {
    return user?.user.role || null;
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    clearError,
    getUserRole,
  };
}
