import { authRepository } from '../../repositories/auth';
import { createAuthController } from './useAuthController';

// production instance of useAuthController with real dependencies injected
export const useAuthController = createAuthController({
  repository: authRepository,
});
