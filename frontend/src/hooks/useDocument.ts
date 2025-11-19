import { useState, useCallback } from 'react';
import { documentApi } from '../services/documentApi';
import type { 
  Document, 
  DocumentUploadRequest,
  VerifiedDocumentUploadRequest,
  DocumentsResponse,
  AppointmentDocumentsParams
} from '../models/Document';

export function useDocument() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsData, setDocumentsData] = useState<DocumentsResponse>({
    verified_documents: [],
    unverified_documents: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Clear messages
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get document by ID
  const getById = useCallback(async (document_id: number): Promise<Document | null> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await documentApi.getById(document_id);
      return response.data || null;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to fetch document';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all unverified documents
  const getUnverified = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await documentApi.getUnverified();
      setDocuments(response.data || []);
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to fetch unverified documents';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all verified documents
  const getVerified = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await documentApi.getVerified();
      setDocuments(response.data || []);
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to fetch verified documents';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all documents
  const getAll = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await documentApi.getAll();
      setDocumentsData(response.data || { verified_documents: [], unverified_documents: [] });
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to fetch documents';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get documents against appointment
  const getAgainstAppointment = useCallback(async (params: AppointmentDocumentsParams): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await documentApi.getAgainstAppointment(params);
      setDocuments(response.data || []);
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to fetch appointment documents';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload unverified document
  const uploadUnverified = useCallback(async (data: DocumentUploadRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await documentApi.uploadUnverified(data);
      setSuccess('Document uploaded successfully');
      
      // Refresh documents list
      await getAll();
      
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to upload document';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  // Upload verified document (lab technician)
  const uploadVerified = useCallback(async (data: VerifiedDocumentUploadRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await documentApi.uploadVerified(data);
      setSuccess('Verified document uploaded successfully');
      
      // Refresh documents list
      await getAll();
      
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to upload verified document';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  // Download document
  const downloadDocument = useCallback(async (document_id: number, filename: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      
      await documentApi.downloadAndSave(document_id, filename);
      setSuccess('Document downloaded successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to download document';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    documents,
    documentsData,
    loading,
    error,
    success,
    getById,
    getUnverified,
    getVerified,
    getAll,
    getAgainstAppointment,
    uploadUnverified,
    uploadVerified,
    downloadDocument,
    clearMessages,
  };
}

export default useDocument;