// Generated: Auth feature — follow DI + repository + zustand factory pattern

import { createAuthRepository } from '../repositories/authRepository';
import { authService } from '../api/authService';
import { createAuthStore } from './createAuthStore';

/**
 * Production wiring - instantiate repository with real service
 */
const authRepository = createAuthRepository({ authService });

/**
 * Production auth store with real repository
 */
export const useAuthStore = createAuthStore({ repository: authRepository });
