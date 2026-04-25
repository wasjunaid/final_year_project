// Document Controller Hook - Manages document state and operations

import { useState } from "react";
import { DocumentModel } from "../../models/document";
import type { InsertPlaceholderPayload } from "../../models/document";
import { getDocumentRepository } from "../../repositories/document";
import type { DocumentListPagination } from "../../repositories/document/documentRepository";

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
  // Placeholders (created by doctors/lab techs)
  placeholdersForPatient: DocumentModel[];
  placeholdersForLabTech: DocumentModel[];
  allDocumentsPagination: DocumentListPagination | null;
  verifiedDocumentsPagination: DocumentListPagination | null;
  unverifiedDocumentsPagination: DocumentListPagination | null;

  // Operations
  fetchAllDocuments: (options?: { search?: string; page?: number; limit?: number }) => Promise<void>;
  fetchUnverifiedDocuments: (options?: { search?: string; page?: number; limit?: number }) => Promise<void>;
  fetchVerifiedDocuments: (options?: { search?: string; page?: number; limit?: number }) => Promise<void>;
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
  exportDocumentsCsv: (options?: { scope?: 'all' | 'verified' | 'unverified'; search?: string }) => Promise<void>;
  fetchPlaceholdersForPatient: () => Promise<DocumentModel[]>;
  fetchPlaceholdersForLabTech: () => Promise<DocumentModel[]>;
  insertPlaceholderForLabTestDocument: (payload: InsertPlaceholderPayload) => Promise<DocumentModel>;
  deleteDocument: (documentId: string) => Promise<void>;
  uploadVerifiedDocumentAgainstPlaceholder: (documentId: string, file: File, detail: string, onUploadProgress?: (e:any)=>void) => Promise<DocumentModel>;
  uploadUnverifiedDocumentAgainstPlaceholder: (documentId: string, file: File, detail: string, onUploadProgress?: (e:any)=>void) => Promise<DocumentModel>;
  fetchAllVerifiedDocumentsAgainstAppointmentGET: () => Promise<DocumentModel[]>;
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
  const [placeholdersForPatient, setPlaceholdersForPatient] = useState<DocumentModel[]>([]);
  const [placeholdersForLabTech, setPlaceholdersForLabTech] = useState<DocumentModel[]>([]);
  const [allDocumentsPagination, setAllDocumentsPagination] = useState<DocumentListPagination | null>(null);
  const [verifiedDocumentsPagination, setVerifiedDocumentsPagination] = useState<DocumentListPagination | null>(null);
  const [unverifiedDocumentsPagination, setUnverifiedDocumentsPagination] = useState<DocumentListPagination | null>(null);

  // Operations
  const fetchAllDocuments = async (options?: { search?: string; page?: number; limit?: number }): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await documentRepository.getAllDocuments(options);
      const fetchedDocuments = result.documents;
      setDocuments(fetchedDocuments);
      setAllDocumentsPagination(result.pagination);
      
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

  const fetchUnverifiedDocuments = async (options?: { search?: string; page?: number; limit?: number }): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await documentRepository.getAllUnverifiedDocuments(options);
      setUnverifiedDocuments(result.documents);
      setUnverifiedDocumentsPagination(result.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch unverified documents";
      setError(errorMessage);
      console.error("Error fetching unverified documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedDocuments = async (options?: { search?: string; page?: number; limit?: number }): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await documentRepository.getAllVerifiedDocuments(options);
      setVerifiedDocuments(result.documents);
      setVerifiedDocumentsPagination(result.pagination);
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

  const fetchPlaceholdersForPatient = async (): Promise<DocumentModel[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentRepository.getPlaceholdersForPatient();
      setPlaceholdersForPatient(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch placeholders';
      setError(errorMessage);
      console.error('Error fetching placeholders for patient:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceholdersForLabTech = async (): Promise<DocumentModel[]> => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching placeholders for lab tech...");
      const data = await documentRepository.getPlaceholdersForLabTech();
      setPlaceholdersForLabTech(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch placeholders';
      setError(errorMessage);
      console.error('Error fetching placeholders for lab tech:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const insertPlaceholderForLabTestDocument = async (payload: InsertPlaceholderPayload): Promise<DocumentModel> => {
    setLoading(true);
    setError(null);
    try {
      const created = await documentRepository.insertPlaceholderForLabTestDocument(payload);
      // add to documents/verified lists as optimistic
      setDocuments(prev => [created, ...prev]);
      if (created.isVerified) setVerifiedDocuments(prev => [created, ...prev]);
      return created;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create placeholder';
      setError(errorMessage);
      console.error('Error inserting placeholder:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await documentRepository.deleteDocument(documentId);
      setDocuments(prev => prev.filter(d => d.documentId !== documentId));
      setVerifiedDocuments(prev => prev.filter(d => d.documentId !== documentId));
      setUnverifiedDocuments(prev => prev.filter(d => d.documentId !== documentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      console.error('Error deleting document:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadVerifiedDocumentAgainstPlaceholder = async (
    documentId: string,
    file: File,
    detail: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<DocumentModel> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    try {
      const uploaded = await documentRepository.uploadVerifiedDocumentAgainstPlaceholder(documentId, file, detail, onUploadProgress);
      // replace or add
      setVerifiedDocuments(prev => [uploaded, ...prev.filter(d => d.documentId !== uploaded.documentId)]);
      setDocuments(prev => [uploaded, ...prev.filter(d => d.documentId !== uploaded.documentId)]);
      setSuccess('Verified document uploaded successfully');
      return uploaded;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload verified document';
      setError(errorMessage);
      console.error('Error uploading verified document against placeholder:', err);
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadUnverifiedDocumentAgainstPlaceholder = async (
    documentId: string,
    file: File,
    detail: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<DocumentModel> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    try {
      const uploaded = await documentRepository.uploadUnverifiedDocumentAgainstPlaceholder(documentId, file, detail, onUploadProgress);
      setUnverifiedDocuments(prev => [uploaded, ...prev.filter(d => d.documentId !== uploaded.documentId)]);
      setDocuments(prev => [uploaded, ...prev.filter(d => d.documentId !== uploaded.documentId)]);
      setSuccess('Document uploaded successfully');
      return uploaded;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
      console.error('Error uploading unverified document against placeholder:', err);
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const fetchAllVerifiedDocumentsAgainstAppointmentGET = async (): Promise<DocumentModel[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentRepository.getAllVerifiedDocumentsAgainstAppointmentGET();
      setVerifiedDocuments(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appointment documents (GET)';
      setError(errorMessage);
      console.error('Error fetching appointment documents (GET):', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportDocumentsCsv = async (options?: { scope?: 'all' | 'verified' | 'unverified'; search?: string }): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await documentRepository.exportDocumentsCsv(options);
      setSuccess('Documents CSV exported successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export documents CSV';
      setError(errorMessage);
      console.error('Error exporting documents CSV:', err);
      throw err;
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

    // placeholders
    placeholdersForPatient,
    placeholdersForLabTech,
    allDocumentsPagination,
    verifiedDocumentsPagination,
    unverifiedDocumentsPagination,

    // Operations
    fetchAllDocuments,
    fetchUnverifiedDocuments,
    fetchVerifiedDocuments,
    fetchDocument,
    fetchDocumentsByAppointment,
    uploadUnverifiedDocument,
    uploadVerifiedDocument,
    downloadDocument,
    exportDocumentsCsv,
    fetchPlaceholdersForPatient,
    fetchPlaceholdersForLabTech,
    insertPlaceholderForLabTestDocument,
    deleteDocument,
    uploadVerifiedDocumentAgainstPlaceholder,
    uploadUnverifiedDocumentAgainstPlaceholder,
    fetchAllVerifiedDocumentsAgainstAppointmentGET,
    clearMessages,
    clearError
  };
};
