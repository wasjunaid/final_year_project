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
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state from localStorage on mount
  const initializeAuth = useCallback(() => {
    const accessToken = tokenService.getAccessToken();
    const refreshToken = tokenService.getRefreshToken();

    if (accessToken && refreshToken) {
      try {
        const payload = decodeJWTPayload(accessToken);
        setAuthState({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          role: payload?.role || null,
          personId: payload?.person_id || null,
          user: null,
        });
      } catch (err) {
        tokenService.clearTokens();
      }
    }

    setInitialized(true);
  }, []);


  // Helper: decode JWT payload (handles base64url)
  const base64UrlDecode = (str: string) => {
    try {
      let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      // Pad with '='
      while (base64.length % 4) {
        base64 += "=";
      }
      return atob(base64);
    } catch (err) {
      return null;
    }
  };

  const decodeJWTPayload = (token: string): any | null => {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payloadPart = parts[1];
    const decoded = base64UrlDecode(payloadPart);
    if (!decoded) return null;
    try {
      return JSON.parse(decoded);
    } catch (err) {
      return null;
    }
  };

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
      console.log("SignIn successful, received auth data:", authData);
      // Store tokens in localStorage
      tokenService.setTokens({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      });

      const decodedPayload = decodeJWTPayload(authData.accessToken);
      console.log("Decoded JWT payload: ", decodedPayload);

      // Update auth state
      setAuthState({
        isAuthenticated: true,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        role: (decodedPayload?.role as UserRole) || null,
        personId: decodedPayload?.person_id || null,
        user: null,
      });

      setSuccess("Successfully signed in");
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Failed to sign in";
      
      // Check if email verification is needed
      if (err.response?.data?.emailVerificationNeeded === true) {
        console.log("Email verification needed");
        // Throw the error with emailVerificationNeeded flag so SignInPage can handle it
        throw {
          emailVerificationNeeded: true,
          message: message
        };
      }

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
      const payload = decodeJWTPayload(tokens.accessToken);

      // Update auth state
      setAuthState({
        isAuthenticated: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        role: (payload?.role as UserRole) || null,
        personId: payload?.person_id || null,
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
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      });

      // Decode new access token to extract role / person_id
      const decoded = decodeJWTPayload(authData.accessToken);

      // Update auth state
      setAuthState(prev => ({
        ...prev,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        role: (decoded?.role as UserRole) || null,
        personId: decoded?.person_id || null,
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

  return {
    ...memoizedValues,
    initialized,
  };
}
