import { useState, useCallback } from 'react';
import type { CodingResponseModel } from '../../models/medicalCoder';
import type { IMedicalCodingAIRepository } from '../../repositories/medicalCoder';

/**
 * AI Coding Controller Interface
 */
export interface IAICodingController {
  // State
  loading: boolean;
  error: string | null;
  codingResult: CodingResponseModel | null;

  // Actions
  analyzeNotes: (providerNotes: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  clearResult: () => void;
  clearError: () => void;
}

/**
 * Create AI Coding Controller Hook
 * Factory function that creates a hook with dependency injection
 */
export const createUseAICodingController = (
  aiRepository: IMedicalCodingAIRepository
) => {
  return (): IAICodingController => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [codingResult, setCodingResult] = useState<CodingResponseModel | null>(null);

    /**
     * Clear error message
     */
    const clearError = useCallback(() => {
      setError(null);
    }, []);

    /**
     * Clear coding result
     */
    const clearResult = useCallback(() => {
      setCodingResult(null);
      setError(null);
    }, []);

    /**
     * Analyze provider notes using AI
     */
    const analyzeNotes = useCallback(async (providerNotes: string) => {
      setLoading(true);
      setError(null);
      setCodingResult(null);

      try {
        const result = await aiRepository.analyzeProviderNotes(providerNotes);
        setCodingResult(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to analyze provider notes';
        setError(errorMessage);
        console.error('Error analyzing notes:', err);
      } finally {
        setLoading(false);
      }
    }, [aiRepository]);

    /**
     * Upload and analyze file using AI
     */
    const uploadFile = useCallback(async (file: File) => {
      setLoading(true);
      setError(null);
      setCodingResult(null);

      try {
        const result = await aiRepository.uploadProviderNotesFile(file);
        
        // Convert FileUploadResponseModel to CodingResponseModel
        setCodingResult({
          icdCodes: result.icdCodes,
          cptCodes: result.cptCodes,
          overallSummary: result.overallSummary,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload and analyze file';
        setError(errorMessage);
        console.error('Error uploading file:', err);
      } finally {
        setLoading(false);
      }
    }, [aiRepository]);

    return {
      loading,
      error,
      codingResult,
      analyzeNotes,
      uploadFile,
      clearResult,
      clearError,
    };
  };
};
