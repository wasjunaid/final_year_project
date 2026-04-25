import { hospitalStaffService } from '../../services/hospitalStaff';
import { createHospitalStaffRepository } from './hospitalStaffRepository';

export const hospitalStaffRepository = createHospitalStaffRepository({ hospitalStaffService });
