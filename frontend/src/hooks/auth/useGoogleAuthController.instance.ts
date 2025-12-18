import { createGoogleAuthController } from './useGoogleAuthController';
import { googleAuthRepository } from '../../repositories/auth/googleAuthRepository.instance';

// Singleton instance with injected dependencies
export const useGoogleAuthController = createGoogleAuthController({
  repository: googleAuthRepository,
});