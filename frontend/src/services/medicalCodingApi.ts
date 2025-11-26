import axios from 'axios';
import type { ApiResponse } from '../models/ApiResponse';

// Fix: Use the correct backend URL from the working curl command
const MEDICAL_CODING_API_BASE_URL = 'https://distopia22-icd-cpt-coding-api-backend.hf.space';

// Updated interfaces based on actual API response
export interface CodeDetail {
  code: string;
  description: string;
  explanation: string;
}

export interface CodingResponse {
  icd_codes: CodeDetail[];
  cpt_codes: CodeDetail[];
  overall_summary: string;
}

export interface FileUploadResponse {
  success: boolean;
  filename: string;
  extracted_text_length: number;
  icd_codes: CodeDetail[];
  cpt_codes: CodeDetail[];
  overall_summary: string;
}

export interface ProviderNotesRequest {
  provider_notes: string;
}

// Create axios instance for medical coding API
const medicalCodingApi = axios.create({
  baseURL: MEDICAL_CODING_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
  },
  timeout: 120000, // 2 minute timeout for AI processing
});

export const medicalCodingService = {
  /**
   * Analyze provider notes and extract ICD-10 and CPT codes
   */
  analyzeNotes: async (providerNotes: string): Promise<ApiResponse<CodingResponse>> => {
    try {
      console.log('Sending request to:', `${MEDICAL_CODING_API_BASE_URL}/api/coding`);
      console.log('Request payload:', { provider_notes: providerNotes });

      const response = await medicalCodingApi.post<CodingResponse>('/api/coding', {
        provider_notes: providerNotes,
      });

      console.log('Response received:', response.data);

      return {
        success: true,
        status: 200,
        data: response.data,
        message: 'Provider notes analyzed successfully',
      };
    } catch (error: any) {
      console.error('Error analyzing notes:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      return {
        success: false,
        status: error.response?.status || 500,
        data: {
          icd_codes: [],
          cpt_codes: [],
          overall_summary: '',
        },
        message: error.response?.data?.detail || error.message || 'Failed to analyze provider notes',
      };
    }
  },

  /**
   * Upload a TXT file containing provider notes and extract codes
   */
  uploadFile: async (file: File): Promise<ApiResponse<FileUploadResponse>> => {
    try {
      console.log('Uploading file:', file.name);

      const formData = new FormData();
      formData.append('file', file);

      const response = await medicalCodingApi.post<FileUploadResponse>(
        '/api/upload-file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            accept: 'application/json',
          },
        }
      );

      console.log('File upload response:', response.data);

      return {
        success: true,
        status: 200,
        data: response.data,
        message: 'File uploaded and analyzed successfully',
      };
    } catch (error: any) {
      console.error('Error uploading file:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      return {
        success: false,
        status: error.response?.status || 500,
        data: {
          success: false,
          filename: '',
          extracted_text_length: 0,
          icd_codes: [],
          cpt_codes: [],
          overall_summary: '',
        },
        message: error.response?.data?.detail || error.message || 'Failed to upload and analyze file',
      };
    }
  },

  /**
   * Health check endpoint
   */
  healthCheck: async (): Promise<ApiResponse<string>> => {
    try {
      console.log('Checking health at:', `${MEDICAL_CODING_API_BASE_URL}/health`);

      const response = await medicalCodingApi.get<string>('/health');

      console.log('Health check response:', response.data);

      return {
        success: true,
        status: 200,
        data: response.data,
        message: 'Service is healthy',
      };
    } catch (error: any) {
      console.error('Health check failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      return {
        success: false,
        status: error.response?.status || 503,
        data: '',
        message: error.response?.data?.detail || error.message || 'Service is unavailable',
      };
    }
  },
};