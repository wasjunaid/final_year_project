import { insuranceRepository } from '../../repositories/insurance';
import { createUseInsuranceController } from './useInsuranceController';

export const useInsuranceController = createUseInsuranceController({ insuranceRepository });
