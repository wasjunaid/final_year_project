import { createUseDoctorAccessRequestController } from './createUseDoctorAccessRequestController';
import accessRequestRepository from '../../repositories/accessRequest/accessRequestRepository';

export const useDoctorAccessController = createUseDoctorAccessRequestController({ repository: accessRequestRepository });

export default useDoctorAccessController;
