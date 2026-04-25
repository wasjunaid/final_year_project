import { createPersonAssociationRepository } from './personAssociationRepository';
import { personAssociationService } from '../../services/associationRequest';

export const personAssociationRepository = createPersonAssociationRepository({ personAssociationService });