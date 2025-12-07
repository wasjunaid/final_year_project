import type { MedicalCoderModel } from '../../models/medicalCoder';
import type * as MedicalCoderService from '../../services/medicalCoder';
import { toMedicalCoderModel } from '../../models/medicalCoder';

/**
 * Medical Coder Repository Interface
 * Defines the contract for medical coder data operations
 */
export interface IMedicalCoderRepository {
  getMedicalCoder(): Promise<MedicalCoderModel>;
  updateHospitalAssociation(): Promise<MedicalCoderModel>;
  removeHospitalAssociation(medicalCoderId: number): Promise<MedicalCoderModel>;
}

/**
 * Medical Coder Repository Factory
 * Creates a repository instance with dependency injection
 */
export const createMedicalCoderRepository = (
  medicalCoderService: typeof MedicalCoderService
): IMedicalCoderRepository => {
  /**
   * Get medical coder information
   */
  const getMedicalCoder = async (): Promise<MedicalCoderModel> => {
    try {
      const dto = await medicalCoderService.getMedicalCoder();
      return toMedicalCoderModel(dto);
    } catch (error) {
      console.error('Error in getMedicalCoder:', error);
      throw error;
    }
  };

  /**
   * Update medical coder's hospital association
   */
  const updateHospitalAssociation = async (): Promise<MedicalCoderModel> => {
    try {
      const dto = await medicalCoderService.updateMedicalCoderHospitalAssociation();
      return toMedicalCoderModel(dto);
    } catch (error) {
      console.error('Error in updateHospitalAssociation:', error);
      throw error;
    }
  };

  /**
   * Remove medical coder's hospital association (for hospital admin)
   */
  const removeHospitalAssociation = async (
    medicalCoderId: number
  ): Promise<MedicalCoderModel> => {
    try {
      if (!medicalCoderId || medicalCoderId <= 0) {
        throw new Error('Invalid medical coder ID');
      }

      const dto = await medicalCoderService.removeMedicalCoderHospitalAssociation(medicalCoderId);
      return toMedicalCoderModel(dto);
    } catch (error) {
      console.error('Error in removeHospitalAssociation:', error);
      throw error;
    }
  };

  return {
    getMedicalCoder,
    updateHospitalAssociation,
    removeHospitalAssociation,
  };
};
