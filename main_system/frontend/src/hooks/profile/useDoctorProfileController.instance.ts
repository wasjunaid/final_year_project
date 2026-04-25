import { createDoctorProfileController } from './useDoctorProfileController';
import { doctorProfileRepository } from '../../repositories/profile/doctorProfileRepository.instance';

export const useDoctorProfileController = createDoctorProfileController({
  repository: doctorProfileRepository,
});
