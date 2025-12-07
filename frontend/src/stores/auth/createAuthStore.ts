import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { decodeJWTPayload } from '../../utils/decodeJWTPayload';
import type { UserRole } from '../../constants/profile';

export interface AuthState {
  // State
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  personId: string | null;
  initialized: boolean; // since decode happens async on rehydration, therefore ui should wait for this flag
  
  // Actions
  setAuth: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearAuth: () => void;
}

// Helper to clear all auth-related storage
const clearAuthStorage = () => {
  try {
    sessionStorage.removeItem('auth-storage');
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('auth-remember-me');
  } catch (error) {
    console.error('[Auth Store] Failed to clear storage:', error);
  }
};

// Helper function for shared validation logic across setAuth and rehydration
const validateAndDecodeToken = (accessToken: string): { role: UserRole; personId: string } | null => {
  try {
    const payload = decodeJWTPayload(accessToken);
    
    // Validate decoded payload
    if (!payload || !payload.role || !payload.person_id) {
      console.error('[Auth Store] Invalid token payload');
      return null;
    }
    
    return {
      role: payload.role,
      personId: String(payload.person_id), // Ensure it's always a string (UUID)
    };
  } catch (error) {
    console.error('[Auth Store] Token decode failed:', error);
    return null;
  }
};

// Factory to create auth store - enables testing with different storage implementations
export const createAuthStore = () => {
  return create<AuthState>()(
    persist(
      (set) => ({
        // Initial state
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        role: null,
        personId: null,
        initialized: false,
        loading: false,
        error: null,

        // Set authentication with tokens
        setAuth: (tokens) => {
          const decoded = validateAndDecodeToken(tokens.accessToken);
          
          if (!decoded) {
            // Invalid token - clear everything
            clearAuthStorage();
            set({
              isAuthenticated: false,
              accessToken: null,
              refreshToken: null,
              role: null,
              personId: null,
            });
            return;
          }
          
          set({
            isAuthenticated: true,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            role: decoded.role,
            personId: decoded.personId,
            initialized: true,
          });
        },

        // Clear authentication
        clearAuth: () => {
          // Clear storage first
          clearAuthStorage();
          
          // Clear auth state
          set({
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            role: null,
            personId: null,
          });
        },
      }),
      {
        name: 'auth-storage',
        // Dynamically determine storage based on rememberMe preference
        storage: createJSONStorage(() => {
          const rememberMe = localStorage.getItem('auth-remember-me') === 'true';
          return rememberMe ? localStorage : sessionStorage;
        }),
        // Only persist tokens
        partialize: (state) => ({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        }),
        // Rehydrate and decode tokens on load
        onRehydrateStorage: () => (state) => {
          if (state && state.accessToken && state.refreshToken) {
            const decoded = validateAndDecodeToken(state.accessToken);
            
            if (decoded) {
              state.isAuthenticated = true;
              state.role = decoded.role;
              state.personId = decoded.personId;
            } else {
              // Invalid token during rehydration - clear everything
              console.error('[Auth Store] Invalid token during rehydration, clearing auth state');
              
              // Clear storage
              clearAuthStorage();

              // Clear state
              state.isAuthenticated = false;
              state.accessToken = null;
              state.refreshToken = null;
              state.role = null;
              state.personId = null;
            }
          }
          
          if (state) {
            state.initialized = true;
          }
        },
      }
    )
  );
};
