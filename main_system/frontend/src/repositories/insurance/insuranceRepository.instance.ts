import { insuranceService } from '../../services/insurance';
import { createInsuranceRepository } from './insuranceRepository';

export const insuranceRepository = createInsuranceRepository({ insuranceService });
