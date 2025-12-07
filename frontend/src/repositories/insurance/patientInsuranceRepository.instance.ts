import { createPatientInsuranceRepository } from './patientInsuranceRepository';
import { patientInsuranceService } from '../../services/insurance';

// Create singleton instance with injected dependencies
export const patientInsuranceRepository = createPatientInsuranceRepository({
  patientInsuranceService,
});
