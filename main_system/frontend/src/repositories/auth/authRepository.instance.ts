import { createAuthRepository } from './authRepository';
import { authService } from '../../services/auth/authService';

// Production auth repository with real service
export const authRepository = createAuthRepository({ authService });
