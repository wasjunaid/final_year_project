import { createHospitalStaffProfileController } from './useHospitalStaffProfileController';
import { hospitalStaffProfileRepository } from '../../repositories/profile/hospitalStaffProfileRepository.instance';

export const useHospitalStaffProfileController = createHospitalStaffProfileController({
  repository: hospitalStaffProfileRepository,
});
