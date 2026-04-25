import { createPatientProfileController } from './usePatientProfileController';
import { patientProfileRepository } from '../../repositories/profile/patientProfileRepository.instance';

export const usePatientProfileController = createPatientProfileController({
  repository: patientProfileRepository,
});
