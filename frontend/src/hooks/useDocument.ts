import { useState, useCallback } from 'react';
import { documentApi } from '../services/documentApi';
import type { Document, DocumentUploadRequest, VerifiedDocumentUploadRequest, DocumentsResponse } from '../models/Document';

export const useDocument = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [verifiedDocuments, setVerifiedDocuments] = useState<Document[]>([]);
  const [unverifiedDocuments, setUnverifiedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Get all documents
  const fetchAllDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await documentApi.getAll();
      
      if (response.success && response.data) {
        // Handle both response formats
        const verified = response.data.verified_documents || response.data.verified || [];
        const unverified = response.data.unverified_documents || response.data.unverified || [];
        
        setVerifiedDocuments(verified);
        setUnverifiedDocuments(unverified);
        setDocuments([...verified, ...unverified]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all verified documents
  const fetchVerifiedDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await documentApi.getVerified();
      
      if (response.success && response.data) {
        setVerifiedDocuments(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch verified documents');
      console.error('Error fetching verified documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all unverified documents
  const fetchUnverifiedDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await documentApi.getUnverified();
      
      if (response.success && response.data) {
        setUnverifiedDocuments(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch unverified documents');
      console.error('Error fetching unverified documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload unverified document
  const uploadUnverified = useCallback(async (data: DocumentUploadRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await documentApi.uploadUnverified(data);
      
      if (response.success) {
        setSuccess('Document uploaded successfully');
        // Refresh documents list
        await fetchAllDocuments();
        return true;
      }
      return false;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload document';
      setError(errorMessage);
      console.error('Error uploading document:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAllDocuments]);

  // Upload verified document (lab technician)
  const uploadVerified = useCallback(async (data: VerifiedDocumentUploadRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await documentApi.uploadVerified(data);
      
      if (response.success) {
        setSuccess('Verified document uploaded successfully');
        // Refresh documents list
        await fetchAllDocuments();
        return true;
      }
      return false;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload verified document';
      setError(errorMessage);
      console.error('Error uploading verified document:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAllDocuments]);

  // Download document
  const downloadDocument = useCallback(async (documentId: number, filename: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await documentApi.downloadAndSave(documentId, filename);
      setSuccess('Document downloaded successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to download document';
      setError(errorMessage);
      console.error('Error downloading document:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    documents,
    verifiedDocuments,
    unverifiedDocuments,
    loading,
    error,
    success,
    fetchAllDocuments,
    fetchVerifiedDocuments,
    fetchUnverifiedDocuments,
    uploadUnverified,
    uploadVerified,
    downloadDocument,
    clearMessages,
  };
};

export default useDocument;