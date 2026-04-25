import apiClient from '../apiClient';
import type { MedicalCoderDto } from '../../models/medicalCoder';

/**
 * Medical Coder Service
 * Handles all API calls related to medical coder operations
 */

/**
 * Get medical coder information for the authenticated user
 */
export const getMedicalCoder = async (): Promise<MedicalCoderDto> => {
  const response = await apiClient.get('/medical-coder');
  return response.data.data;
};

/**
 * Update medical coder's hospital association
 * This endpoint updates the association automatically based on the authenticated user
 */
export const updateMedicalCoderHospitalAssociation = async (): Promise<MedicalCoderDto> => {
  const response = await apiClient.put('/medical-coder/update-hospital');
  return response.data.data;
};

/**
 * Remove medical coder's hospital association (for hospital admin)
 */
export const removeMedicalCoderHospitalAssociation = async (
  medicalCoderId: number
): Promise<MedicalCoderDto> => {
  const response = await apiClient.put(`/medical-coder/remove-hospital/${medicalCoderId}`);
  return response.data.data;
};
