import { createHospitalAssociationRepository } from './hospitalAssociationRepository';
import { hospitalAssociationService } from '../../services/associationRequest';

export const hospitalAssociationRepository = createHospitalAssociationRepository({ hospitalAssociationService });