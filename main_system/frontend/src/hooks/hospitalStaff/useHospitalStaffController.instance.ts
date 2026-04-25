import { hospitalStaffRepository } from '../../repositories/hospitalStaff';
import { createUseHospitalStaffController } from './useHospitalStaffController';

export const useHospitalStaffController = createUseHospitalStaffController({ hospitalStaffRepository });
