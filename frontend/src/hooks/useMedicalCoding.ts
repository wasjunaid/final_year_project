import { useState, useCallback } from 'react';
import { medicalCodingService, type CodingResponse, type FileUploadResponse } from '../services/medicalCodingApi';

export const useMedicalCoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [codingResult, setCodingResult] = useState<CodingResponse | null>(null);
  const [fileUploadResult, setFileUploadResult] = useState<FileUploadResponse | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const clearResults = useCallback(() => {
    setCodingResult(null);
    setFileUploadResult(null);
    clearMessages();
  }, [clearMessages]);

  const analyzeNotes = useCallback(async (providerNotes: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setCodingResult(null);

      if (!providerNotes.trim()) {
        setError('Provider notes cannot be empty');
        return false;
      }

      const response = await medicalCodingService.analyzeNotes(providerNotes);

      if (response.success && response.data) {
        setCodingResult(response.data);
        setSuccess(response.message || 'Analysis completed successfully');
        return true;
      } else {
        setError(response.message || 'Failed to analyze provider notes');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred during analysis';
      setError(errorMessage);
      console.error('Error analyzing provider notes:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setFileUploadResult(null);

      // Validate file type
      if (!file.name.endsWith('.txt')) {
        setError('Only .txt files are supported');
        return false;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return false;
      }

      const response = await medicalCodingService.uploadFile(file);

      if (response.success && response.data) {
        setFileUploadResult(response.data);
        setSuccess(response.message || 'File uploaded and analyzed successfully');
        return true;
      } else {
        setError(response.message || 'Failed to upload and analyze file');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred during file upload';
      setError(errorMessage);
      console.error('Error uploading file:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await medicalCodingService.healthCheck();

      if (response.success) {
        setSuccess('Service is healthy and ready');
        return true;
      } else {
        setError('Service is currently unavailable');
        return false;
      }
    } catch (err) {
      setError('Failed to connect to medical coding service');
      console.error('Health check failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    success,
    codingResult,
    fileUploadResult,
    analyzeNotes,
    uploadFile,
    checkHealth,
    clearMessages,
    clearResults,
  };
};