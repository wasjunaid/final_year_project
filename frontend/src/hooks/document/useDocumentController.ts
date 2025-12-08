// Document Controller Hook - Manages document state and operations

import { useState } from "react";
import { DocumentModel } from "../../models/document";
import { getDocumentRepository } from "../../repositories/document";

export interface IDocumentController {
  // State
  documents: DocumentModel[];
  unverifiedDocuments: DocumentModel[];
  verifiedDocuments: DocumentModel[];
  currentDocument: DocumentModel | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  uploadProgress: number;
  isUploading: boolean;

  // Operations
  fetchAllDocuments: () => Promise<void>;
  fetchUnverifiedDocuments: () => Promise<void>;
  fetchVerifiedDocuments: () => Promise<void>;
  fetchDocument: (documentId: string) => Promise<void>;
  fetchDocumentsByAppointment: (appointmentId: number) => Promise<void>;
  uploadUnverifiedDocument: (file: File, documentType: string, detail: string) => Promise<void>;
  uploadVerifiedDocument: (
    file: File,
    detail: string,
    patientId?: number,
    appointmentId?: number,
    labTestId?: number,
  ) => Promise<void>;
  downloadDocument: (documentId: string, originalName: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useDocumentController = (): IDocumentController => {
  const documentRepository = getDocumentRepository();

  // State
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [unverifiedDocuments, setUnverifiedDocuments] = useState<DocumentModel[]>([]);
  const [verifiedDocuments, setVerifiedDocuments] = useState<DocumentModel[]>([]);
  const [currentDocument, setCurrentDocument] = useState<DocumentModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Operations
  const fetchAllDocuments = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const fetchedDocuments = await documentRepository.getAllDocuments();
      setDocuments(fetchedDocuments);
      
      // Also populate verified and unverified arrays by filtering
      const verified = fetchedDocuments.filter(doc => doc.isVerified);
      const unverified = fetchedDocuments.filter(doc => !doc.isVerified);
      setVerifiedDocuments(verified);
      setUnverifiedDocuments(unverified);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch documents";
      setError(errorMessage);
      console.error("Error fetching all documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnverifiedDocuments = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const fetchedDocuments = await documentRepository.getAllUnverifiedDocuments();
      setUnverifiedDocuments(fetchedDocuments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch unverified documents";
      setError(errorMessage);
      console.error("Error fetching unverified documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedDocuments = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const fetchedDocuments = await documentRepository.getAllVerifiedDocuments();
      setVerifiedDocuments(fetchedDocuments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch verified documents";
      setError(errorMessage);
      console.error("Error fetching verified documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocument = async (documentId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const fetchedDocument = await documentRepository.getDocument(documentId);
      setCurrentDocument(fetchedDocument);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch document";
      setError(errorMessage);
      console.error("Error fetching document:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentsByAppointment = async (appointmentId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const fetchedDocuments = await documentRepository.getAllVerifiedDocumentsAgainstAppointment(
        appointmentId
      );
      setVerifiedDocuments(fetchedDocuments);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch documents for appointment";
      setError(errorMessage);
      console.error("Error fetching documents by appointment:", err);
    } finally {
      setLoading(false);
    }
  };

  const uploadUnverifiedDocument = async (
    file: File,
    documentType: string,
    detail: string
  ): Promise<void> => {
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    // Create optimistic document for immediate UI feedback
    const optimisticDoc: Partial<DocumentModel> = {
      documentId: `temp-${Date.now()}`,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      createdAt: new Date(),
      documentType: null,
      isVerified: false,
      detail: detail,
    };

    // Add optimistic document to state
    setUnverifiedDocuments((prev) => [optimisticDoc as DocumentModel, ...prev]);
    setDocuments((prev) => [optimisticDoc as DocumentModel, ...prev]);

    try {
      // Track real upload progress from axios
      const onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      const uploadedDocument = await documentRepository.uploadUnverifiedDocument(
        file,
        documentType,
        detail,
        onUploadProgress
      );

      setUploadProgress(100);

      // Replace optimistic document with real one
      setUnverifiedDocuments((prev) =>
        prev.map((doc) =>
          doc.documentId === optimisticDoc.documentId ? uploadedDocument : doc
        )
      );
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.documentId === optimisticDoc.documentId ? uploadedDocument : doc
        )
      );

      setSuccess("Document uploaded successfully");
      
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      // Remove optimistic document on error
      setUnverifiedDocuments((prev) =>
        prev.filter((doc) => doc.documentId !== optimisticDoc.documentId)
      );
      setDocuments((prev) =>
        prev.filter((doc) => doc.documentId !== optimisticDoc.documentId)
      );

      const errorMessage = err instanceof Error ? err.message : "Failed to upload document";
      setError(errorMessage);
      console.error("Error uploading unverified document:", err);
      setUploadProgress(0);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadVerifiedDocument = async (
    file: File,
    detail: string,
    patientId?: number,
    appointmentId?: number,
    labTestId?: number,
  ): Promise<void> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    // Create optimistic placeholder
    const optimisticDoc: Partial<DocumentModel> = {
      documentId: `temp-${Date.now()}`,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      createdAt: new Date(),
      documentType: null,
      isVerified: true,
      detail: detail,
    };

    // Add temp doc immediately
    setVerifiedDocuments((prev) => [optimisticDoc as DocumentModel, ...prev]);
    setDocuments((prev) => [optimisticDoc as DocumentModel, ...prev]);

    try {
      const onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      const uploadedDocument = await documentRepository.uploadVerifiedDocument(
        file,
        detail,
        patientId,
        appointmentId,
        labTestId,
        onUploadProgress
      );

      setUploadProgress(100);

      // Replace optimistic with real doc
      setVerifiedDocuments((prev) => prev.map((doc) => doc.documentId === optimisticDoc.documentId ? uploadedDocument : doc));
      setDocuments((prev) => prev.map((doc) => doc.documentId === optimisticDoc.documentId ? uploadedDocument : doc));

      setSuccess("Verified document uploaded successfully");

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err: any) {
      // Remove temp doc on failure
      setVerifiedDocuments((prev) => prev.filter((doc) => doc.documentId !== optimisticDoc.documentId));
      setDocuments((prev) => prev.filter((doc) => doc.documentId !== optimisticDoc.documentId));

      const serverMessage = err?.response?.data?.message;
      const errorMessage = serverMessage || (err instanceof Error ? err.message : "Failed to upload verified document");
      setError(errorMessage);

      console.error("Error uploading verified document:", err, "serverMessage:", serverMessage );

      setUploadProgress(0);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const downloadDocument = async (documentId: string, originalName: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const blobUrl = await documentRepository.downloadDocument(documentId);

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

      setSuccess("Document downloaded successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download document";
      setError(errorMessage);
      console.error("Error downloading document:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = (): void => {
    setError(null);
    setSuccess(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    // State
    documents,
    unverifiedDocuments,
    verifiedDocuments,
    currentDocument,
    loading,
    error,
    success,
    uploadProgress,
    isUploading,

    // Operations
    fetchAllDocuments,
    fetchUnverifiedDocuments,
    fetchVerifiedDocuments,
    fetchDocument,
    fetchDocumentsByAppointment,
    uploadUnverifiedDocument,
    uploadVerifiedDocument,
    downloadDocument,
    clearMessages,
    clearError
  };
};
