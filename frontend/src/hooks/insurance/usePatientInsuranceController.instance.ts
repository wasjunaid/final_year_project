import { createUsePatientInsuranceController } from './usePatientInsuranceController';
import { patientInsuranceRepository, insuranceRepository } from '../../repositories/insurance';

// Create singleton instance with injected dependencies
export const usePatientInsuranceController = createUsePatientInsuranceController({
  patientInsuranceRepository,
  insuranceRepository,
});
