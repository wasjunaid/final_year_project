import { createMedicalCoderRepository, createMedicalCodingAIRepository } from '../../repositories/medicalCoder';
import * as MedicalCoderService from '../../services/medicalCoder';
import * as MedicalCodingAIService from '../../services/medicalCoder/medicalCodingAIService';
import { createUseMedicalCoderManagementController } from './useMedicalCoderManagementController';
import { createUseAICodingController } from './useAICodingController';

// Create repositories with service dependencies
const medicalCoderRepository = createMedicalCoderRepository(MedicalCoderService);
const medicalCodingAIRepository = createMedicalCodingAIRepository(MedicalCodingAIService);

// Create and export the hooks with repository dependencies
export const useMedicalCoderManagementController = createUseMedicalCoderManagementController(
  medicalCoderRepository
);

export const useAICodingController = createUseAICodingController(
  medicalCodingAIRepository
);

// Export types
export type { IMedicalCoderManagementController } from './useMedicalCoderManagementController';
export type { IAICodingController } from './useAICodingController';
