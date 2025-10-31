/**
 * useAuth Hook
 * 
 * A comprehensive authentication hook that manages user authentication state
 * with localStorage persistence for tokens. This hook provides:
 * 
 * Features:
 * - Token storage in localStorage (persists across browser refreshes/restarts)
 * - Automatic token refresh on API errors
 * - JWT token decoding for role and person_id extraction
 * - Sign in, sign up, and sign out functionality
 * - Role-based access control helpers
 * - Automatic message clearing
 * - Loading states for better UX
 * 
 * Usage:
 * ```tsx
 * const {
 *   isAuthenticated,
 *   role,
 *   personId,
 *   signIn,
 *   signOut,
 *   hasRole,
 *   loading,
 *   error
 * } = useAuth();
 * 
 * // Sign in
 * await signIn({ email, password, role: ROLES.PATIENT });
 * 
 * // Check roles
 * if (hasRole(ROLES.DOCTOR)) {
 *   // Doctor-specific logic
 * }
 * ```
 * 
 * The hook automatically initializes authentication state from localStorage
 * on mount and manages token refresh through the api interceptor.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/authApi";
import { tokenService } from "../services/tokenService";
import type { 
  Auth, 
  SignInRequest, 
  SignUpRequest,
  RefreshJWTRequest 
} from "../models/Auth";
import type { Person } from "../models/Person";
import type { UserRole } from "../constants/roles";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  personId: number | null;
  user: Person | null;
}

interface SignInData {
  email: string;
  password: string;
  role: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    role: null,
    personId: null,
    user: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initialize auth state from localStorage on mount
  const initializeAuth = useCallback(() => {
    const accessToken = tokenService.getAccessToken();
    const refreshToken = tokenService.getRefreshToken();
    
    if (accessToken && refreshToken) {
      // Decode token to get role and person_id (basic JWT decode)
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        setAuthState({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          role: payload.role || null,
          personId: payload.person_id || null,
          user: null, // Will be fetched separately if needed
        });
      } catch (err) {
        // Invalid token, clear it
        tokenService.clearTokens();
        setAuthState({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          role: null,
          personId: null,
          user: null,
        });
      }
    }
  }, []);

  // Sign in function
  const signIn = useCallback(async (credentials: SignInData): Promise<boolean> => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const signInRequest: SignInRequest = {
        email: credentials.email,
        password: credentials.password,
        role: credentials.role,
      };

      const response = await authApi.signIn(signInRequest);
      const authData: Auth = response.data;

      // Store tokens in localStorage
      tokenService.setTokens({
        accessToken: authData.accessJWT,
        refreshToken: authData.refreshJWT,
      });

      // Update auth state
      setAuthState({
        isAuthenticated: true,
        accessToken: authData.accessJWT,
        refreshToken: authData.refreshJWT,
        role: authData.role as UserRole,
        personId: authData.person_id,
        user: null,
      });

      setSuccess("Successfully signed in");
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Failed to sign in";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with tokens (for Google Auth)
  const signInWithTokens = useCallback((tokens: { accessToken: string; refreshToken: string }) => {
    try {
      // Store tokens in localStorage
      tokenService.setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      // Decode token to get role and person_id
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));

      // Update auth state
      setAuthState({
        isAuthenticated: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        role: payload.role as UserRole,
        personId: payload.person_id,
        user: null,
      });

      setSuccess("Successfully authenticated with Google");
      return true;
    } catch (err) {
      setError("Failed to authenticate with Google tokens");
      return false;
    }
  }, []);

  // Sign up function
  const signUp = useCallback(async (userData: SignUpRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await authApi.signUp(userData);
      setSuccess("Account created successfully. Please verify your email.");
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Failed to create account";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out function
  const signOut = useCallback(() => {
    tokenService.clearTokens();
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      role: null,
      personId: null,
      user: null,
    });
    setSuccess("Successfully signed out");
  }, []);

  // Refresh JWT function
  const refreshJWT = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = authState.refreshToken;
      if (!refreshToken) {
        signOut();
        return false;
      }

      const refreshRequest: RefreshJWTRequest = {
        refreshJWT: refreshToken,
      };

      const response = await authApi.refreshJWT(refreshRequest);
      const authData: Auth = response.data;

      // Update tokens
      tokenService.setTokens({
        accessToken: authData.accessJWT,
        refreshToken: authData.refreshJWT,
      });

      // Update auth state
      setAuthState(prev => ({
        ...prev,
        accessToken: authData.accessJWT,
        refreshToken: authData.refreshJWT,
        role: authData.role as UserRole,
        personId: authData.person_id,
      }));

      return true;
    } catch (err: any) {
      // Refresh failed, sign out user
      signOut();
      return false;
    }
  }, [authState.refreshToken, signOut]);

  // Set user data (can be called after fetching user profile)
  const setUser = useCallback((user: Person) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  // Check if user has a specific role
  const hasRole = useCallback((role: UserRole): boolean => {
    return authState.role === role;
  }, [authState.role]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return authState.role ? roles.includes(authState.role) : false;
  }, [authState.role]);

  // Memoized return value
  const memoizedValues = useMemo(
    () => ({
      // Auth state
      isAuthenticated: authState.isAuthenticated,
      loading,
      error,
      success,
      
      // User data
      user: authState.user,
      role: authState.role,
      personId: authState.personId,
      
      // Tokens
      accessToken: authState.accessToken,
      refreshToken: authState.refreshToken,
      
      // Actions
      signIn,
      signInWithTokens,
      signUp,
      signOut,
      refreshJWT,
      setUser,
      clearMessages,
      
      // Utilities
      hasRole,
      hasAnyRole,
    }),
    [
      authState,
      loading,
      error,
      success,
      signIn,
      signInWithTokens,
      signUp,
      signOut,
      refreshJWT,
      setUser,
      clearMessages,
      hasRole,
      hasAnyRole,
    ]
  );

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, clearMessages]);

  return memoizedValues;
}
