import { createGoogleAuthRepository } from './googleAuthRepository';
import { googleAuthService } from '../../services/auth/googleAuthService';

// Singleton instance with injected dependencies
export const googleAuthRepository = createGoogleAuthRepository({
  googleAuthService,
});