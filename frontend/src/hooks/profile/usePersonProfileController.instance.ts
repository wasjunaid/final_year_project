import { createPersonProfileController } from './usePersonProfileController';
import { personProfileRepository } from '../../repositories/profile/personProfileRepository.instance';

export const usePersonProfileController = createPersonProfileController({
  repository: personProfileRepository,
});
