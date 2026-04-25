import { createUsePatientAccessRequestController } from './createUsePatientAccessRequestController';
import accessRequestRepository from '../../repositories/accessRequest/accessRequestRepository';

export const usePatientAccessController = createUsePatientAccessRequestController({ repository: accessRequestRepository });

export default usePatientAccessController;
