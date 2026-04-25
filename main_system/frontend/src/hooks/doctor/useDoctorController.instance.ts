import doctorRepository from '../../repositories/doctor/doctorRepository';
import { createUseDoctorController } from './useDoctorController';

export const useDoctorController = createUseDoctorController({ doctorRepository });

export default useDoctorController;
