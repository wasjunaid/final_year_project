// Generated: Auth feature — follow DI + repository + zustand factory pattern

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthModel, LoginPayload, SignupPayload } from '../models/auth';
import type { AuthRepository } from '../repositories/authRepository';

/**
 * Auth store state shape
 */
interface AuthState {
  user: AuthModel | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<void>;
  clearError: () => void;
}

/**
 * Create auth store factory with DI for repository
 */
export function createAuthStore(dependencies: { repository: AuthRepository }) {
  const { repository } = dependencies;

  return create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,

        /**
         * Login user
         */
        login: async (payload: LoginPayload) => {
          set({ loading: true, error: null });
          try {
            const authData = await repository.login(payload);
            
            // Persist token to localStorage
            localStorage.setItem('token', authData.token);
            if (authData.refreshToken) {
              localStorage.setItem('refreshToken', authData.refreshToken);
            }
            
            set({ 
              user: authData, 
              loading: false, 
              isAuthenticated: true,
              error: null 
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            set({ loading: false, error: message, isAuthenticated: false });
            throw error;
          }
        },

        /**
         * Register new user
         */
        signup: async (payload: SignupPayload) => {
          set({ loading: true, error: null });
          try {
            const authData = await repository.signup(payload);
            
            // Persist token to localStorage
            localStorage.setItem('token', authData.token);
            if (authData.refreshToken) {
              localStorage.setItem('refreshToken', authData.refreshToken);
            }
            
            set({ 
              user: authData, 
              loading: false, 
              isAuthenticated: true,
              error: null 
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Signup failed';
            set({ loading: false, error: message, isAuthenticated: false });
            throw error;
          }
        },

        /**
         * Logout user
         */
        logout: async () => {
          set({ loading: true, error: null });
          try {
            await repository.logout();
            
            // Clear tokens from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            
            set({ 
              user: null, 
              loading: false, 
              isAuthenticated: false,
              error: null 
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Logout failed';
            set({ loading: false, error: message });
            // Still clear local state even if API call fails
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false });
          }
        },

        /**
         * Verify existing token
         */
        verifyToken: async () => {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ isAuthenticated: false, user: null });
            return;
          }

          set({ loading: true, error: null });
          try {
            const authData = await repository.verifyToken();
            set({ 
              user: authData, 
              loading: false, 
              isAuthenticated: true,
              error: null 
            });
          } catch (error) {
            // Token invalid - clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            set({ 
              user: null, 
              loading: false, 
              isAuthenticated: false,
              error: null 
            });
          }
        },

        /**
         * Clear error state
         */
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-storage', // localStorage key
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }), // Only persist user and auth status, not loading/error
      }
    )
  );
}
