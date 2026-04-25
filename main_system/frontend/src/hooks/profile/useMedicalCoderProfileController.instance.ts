import { createMedicalCoderProfileController } from './useMedicalCoderProfileController';
import { medicalCoderProfileRepository } from '../../repositories/profile/medicalCoderProfileRepository.instance';

export const useMedicalCoderProfileController = createMedicalCoderProfileController({
  repository: medicalCoderProfileRepository,
});
