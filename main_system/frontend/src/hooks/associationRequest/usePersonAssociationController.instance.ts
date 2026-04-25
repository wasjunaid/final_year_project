import { personAssociationRepository } from '../../repositories/associationRequest';
import { createUsePersonAssociationController } from './usePersonAssociationController';

export const usePersonAssociationController = createUsePersonAssociationController({ personAssociationRepository });