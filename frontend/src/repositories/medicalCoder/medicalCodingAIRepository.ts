import type { CodingResponseModel, FileUploadResponseModel } from '../../models/medicalCoder';
import type * as MedicalCodingAIService from '../../services/medicalCoder/medicalCodingAIService';
import { toCodingResponseModel, toFileUploadResponseModel } from '../../models/medicalCoder';

/**
 * Medical Coding AI Repository Interface
 * Defines the contract for AI coding operations
 */
export interface IMedicalCodingAIRepository {
  analyzeProviderNotes(providerNotes: string): Promise<CodingResponseModel>;
  uploadProviderNotesFile(file: File): Promise<FileUploadResponseModel>;
  checkHealth(): Promise<string>;
}

/**
 * Medical Coding AI Repository Factory
 * Creates a repository instance with dependency injection
 */
export const createMedicalCodingAIRepository = (
  medicalCodingAIService: typeof MedicalCodingAIService
): IMedicalCodingAIRepository => {
  /**
   * Analyze provider notes and extract ICD/CPT codes using AI
   */
  const analyzeProviderNotes = async (providerNotes: string): Promise<CodingResponseModel> => {
    try {
      if (!providerNotes || providerNotes.trim().length === 0) {
        throw new Error('Provider notes cannot be empty');
      }

      const dto = await medicalCodingAIService.analyzeProviderNotes(providerNotes);
      return toCodingResponseModel(dto);
    } catch (error) {
      console.error('Error in analyzeProviderNotes:', error);
      throw error;
    }
  };

  /**
   * Upload and analyze a file containing provider notes
   */
  const uploadProviderNotesFile = async (file: File): Promise<FileUploadResponseModel> => {
    try {
      if (!file) {
        throw new Error('File is required');
      }

      if (file.type !== 'text/plain') {
        throw new Error('Only .txt files are supported');
      }

      if (file.size === 0) {
        throw new Error('File cannot be empty');
      }

      // Optional: Add file size limit (e.g., 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      const dto = await medicalCodingAIService.uploadProviderNotesFile(file);
      return toFileUploadResponseModel(dto);
    } catch (error) {
      console.error('Error in uploadProviderNotesFile:', error);
      throw error;
    }
  };

  /**
   * Check the health of the AI coding service
   */
  const checkHealth = async (): Promise<string> => {
    try {
      return await medicalCodingAIService.checkAIServiceHealth();
    } catch (error) {
      console.error('Error in checkHealth:', error);
      throw error;
    }
  };

  return {
    analyzeProviderNotes,
    uploadProviderNotesFile,
    checkHealth,
  };
};
