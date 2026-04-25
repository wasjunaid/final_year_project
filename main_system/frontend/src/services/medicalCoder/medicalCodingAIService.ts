import axios from 'axios';
import type { CodingResponseDto, FileUploadResponseDto } from '../../models/medicalCoder';

/**
 * Medical Coding AI Service
 * External AI API for analyzing provider notes and extracting ICD-10/CPT codes
 */

const MEDICAL_CODING_AI_BASE_URL = 'https://distopia22-icd-cpt-coding-api-backend.hf.space';

// Create axios instance for medical coding AI API
const medicalCodingAIClient = axios.create({
  baseURL: MEDICAL_CODING_AI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
  },
  timeout: 120000, // 2 minute timeout for AI processing
});

/**
 * Analyze provider notes and extract ICD-10 and CPT codes using AI
 */
export const analyzeProviderNotes = async (providerNotes: string): Promise<CodingResponseDto> => {
  const response = await medicalCodingAIClient.post<CodingResponseDto>('/api/coding', {
    provider_notes: providerNotes,
  });
  return response.data;
};

/**
 * Upload a TXT file containing provider notes and extract codes using AI
 */
export const uploadProviderNotesFile = async (file: File): Promise<FileUploadResponseDto> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await medicalCodingAIClient.post<FileUploadResponseDto>(
    '/api/upload-file',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        accept: 'application/json',
      },
    }
  );
  return response.data;
};

/**
 * Health check for the AI coding service
 */
export const checkAIServiceHealth = async (): Promise<string> => {
  const response = await medicalCodingAIClient.get<string>('/health');
  return response.data;
};
