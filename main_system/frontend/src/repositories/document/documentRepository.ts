// Document Repository - Business logic and validation layer

import { DocumentService } from "../../services/document";
import {
  DocumentModel,
  DocumentTransformer
} from "../../models/document";
import type {
  GetAllVerifiedDocumentsAgainstAppointmentPayload
} from "../../models/document";
import type { InsertPlaceholderPayload } from "../../models/document";

export interface DocumentListPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface DocumentListResult {
  documents: DocumentModel[];
  pagination: DocumentListPagination | null;
}

export class DocumentRepository {
  private readonly documentService: typeof DocumentService;

  constructor(documentService: typeof DocumentService) {
    this.documentService = documentService;
  }

  //Get a single document by ID
  async getDocument(documentId: string): Promise<DocumentModel> {
    if (!documentId || documentId.trim() === "") {
      throw new Error("Document ID is required");
    }

    const response = await this.documentService.getDocument(documentId);
    return DocumentTransformer.toModel(response.data);
  }

  //Get all unverified documents
  async getAllUnverifiedDocuments(options?: { search?: string; page?: number; limit?: number }): Promise<DocumentListResult> {
    const response = await this.documentService.getAllUnverifiedDocuments(options);
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("Invalid response structure for unverified documents:", response);
      return { documents: [], pagination: null };
    }

    return {
      documents: DocumentTransformer.toModels(response.data),
      pagination: (response as any).pagination || null,
    };
  }

  //Get all verified documents
  async getAllVerifiedDocuments(options?: { search?: string; page?: number; limit?: number }): Promise<DocumentListResult> {
    const response = await this.documentService.getAllVerifiedDocuments(options);
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("Invalid response structure for verified documents:", response);
      return { documents: [], pagination: null };
    }

    return {
      documents: DocumentTransformer.toModels(response.data),
      pagination: (response as any).pagination || null,
    };
  }

  //Get all documents (verified + unverified)
  async getAllDocuments(options?: { search?: string; page?: number; limit?: number }): Promise<DocumentListResult> {
    const response = await this.documentService.getAllDocuments(options);
    
    if (!response || !response.data) {
      console.error("Invalid response structure for all documents:", response);
      return { documents: [], pagination: null };
    }
    
    const data = response.data as any;
    const allDocuments = Array.isArray(data)
      ? data
      : [
          ...(Array.isArray(data?.unverified) ? data.unverified : []),
          ...(Array.isArray(data?.verified) ? data.verified : []),
        ];

    const topLevelPagination = (response as any)?.pagination || data?.pagination;
    const unverifiedPagination = topLevelPagination?.unverified || null;
    const verifiedPagination = topLevelPagination?.verified || null;
    const combinedPagination =
      topLevelPagination && typeof topLevelPagination.page === 'number'
        ? topLevelPagination
        : (unverifiedPagination || verifiedPagination
          ? {
              page: (unverifiedPagination?.page ?? verifiedPagination?.page ?? 1),
              limit: (unverifiedPagination?.limit ?? verifiedPagination?.limit ?? 50),
              totalItems: (unverifiedPagination?.totalItems ?? 0) + (verifiedPagination?.totalItems ?? 0),
              totalPages: Math.max(unverifiedPagination?.totalPages ?? 0, verifiedPagination?.totalPages ?? 0),
            }
          : null);

    return {
      documents: DocumentTransformer.toModels(allDocuments),
      pagination: combinedPagination,
    };
  }

  //Get all verified documents for a specific appointment
  async getAllVerifiedDocumentsAgainstAppointment(
    appointmentId: number
  ): Promise<DocumentModel[]> {
    if (!appointmentId || appointmentId <= 0) {
      throw new Error("Valid appointment ID is required");
    }

    const payload: GetAllVerifiedDocumentsAgainstAppointmentPayload = {
      appointment_id: appointmentId
    };

    const response = await this.documentService.getAllVerifiedDocumentsAgainstAppointment(payload);
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("Invalid response structure for appointment documents:", response);
      return [];
    }
    return DocumentTransformer.toModels(response.data);
  }

  //Upload an unverified document (patient uploads)
  async uploadUnverifiedDocument(
    file: File,
    documentType: string,
    detail: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<DocumentModel> {
    // Validation
    if (!file) {
      throw new Error("File is required");
    }

    if (!(file instanceof File)) {
      console.error('uploadUnverifiedDocument: invalid file object', file);
      throw new Error('Invalid file provided for upload');
    }

    if (!documentType || documentType.trim() === "") {
      throw new Error("Document type is required");
    }

    if (!detail || detail.trim() === "") {
      throw new Error("Document detail is required");
    }

    // File size validation (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds maximum limit of 10MB");
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only PDF, images, and Word documents are allowed");
    }

    // Create FormData with file and metadata
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('detail', detail.trim());

    const response = await this.documentService.uploadUnverifiedDocument(formData, onUploadProgress);
    return DocumentTransformer.toModel(response.data);
  }

  //Upload a verified document (frontdesk, lab technician, doctor, hospital admin can use this)
  async uploadVerifiedDocument(
    file: File,
    detail: string,
    patientId?: number,
    appointmentId?: number,
    labTestId?: number,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<DocumentModel> {
    // Validation
    if (!file) {
      throw new Error("File is required");
    }

    if (!(file instanceof File)) {
      console.error('uploadVerifiedDocument: invalid file object', file);
      throw new Error('Invalid file provided for upload');
    }

    // detail is required
    if (!detail || detail.trim() === "") {
      throw new Error("Document detail is required");
    }

    if (!patientId && !appointmentId && !labTestId) {
      throw new Error("At least one of patientId, appointmentId, or labTestId must be provided");
    }

    // File size validation (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds maximum limit of 10MB");
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only PDF, images, and Word documents are allowed");
    }

    // Build FormData to send only the file and minimal identifiers. Backend will add metadata (mimetype, filesize, stored filename, etc.).
    const formData = new FormData();
    formData.append('file', file);
    if (detail && detail.trim() !== '') {
      formData.append('detail', detail.trim());
    }
    if (patientId && patientId > 0) {
      formData.append('patient_id', String(patientId));
    }
    if (appointmentId && appointmentId > 0) {
      formData.append('appointment_id', String(appointmentId));
    }
    if (labTestId && labTestId > 0) {
      formData.append('lab_test_id', String(labTestId));
    }

    const response = await this.documentService.uploadVerifiedDocument(formData, onUploadProgress);
    return DocumentTransformer.toModel(response.data);
  }

  //Download a document
  async downloadDocument(documentId: string): Promise<string> {
    if (!documentId || documentId.trim() === "") {
      throw new Error("Document ID is required");
    }

    return await this.documentService.downloadDocument(documentId);
  }

  async exportDocumentsCsv(options?: { scope?: 'all' | 'verified' | 'unverified'; search?: string }): Promise<void> {
    const csvBlob = await this.documentService.exportDocumentsCsv(options);
    const csvUrl = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = csvUrl;
    const scope = options?.scope || 'all';
    link.download = `documents-export-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(csvUrl);
  }

  // Get placeholders created for patient (lab test placeholders)
  async getPlaceholdersForPatient(): Promise<DocumentModel[]> {
    const response = await this.documentService.getPlaceholdersForPatient();
    if (!response || !response.data) return [];
    const arr = Array.isArray(response.data) ? response.data : (response.data as any).data ?? [];
    return DocumentTransformer.toModels(arr as any[]);
  }

  // Get placeholders created for lab technicians
  async getPlaceholdersForLabTech(): Promise<DocumentModel[]> {
    const response = await this.documentService.getPlaceholdersForLabTech();
    if (!response || !response.data) return [];
    const arr = Array.isArray(response.data) ? response.data : (response.data as any).data ?? [];
    return DocumentTransformer.toModels(arr as any[]);
  }

  // Insert a placeholder for a lab test document (doctor creates)
  async insertPlaceholderForLabTestDocument(payload: InsertPlaceholderPayload): Promise<DocumentModel> {
    console.log("[DocumentRepository: insertPlaceholderForLabTestDocument] payload:", payload);
    const response = await this.documentService.insertPlaceholderForLabTestDocument(payload as any);
    console.log("[DocumentRepository: insertPlaceholderForLabTestDocument] response:", response);
    if (!response || !response.data) throw new Error('Failed to insert placeholder');
    return DocumentTransformer.toModel(response.data);
  }

  // Delete a document by ID
  async deleteDocument(documentId: string): Promise<void> {
    const response = await this.documentService.deleteDocument(documentId);
    if (!response || !response.success) {
      const msg = (response && (response as any).message) || 'Failed to delete document';
      throw new Error(msg);
    }
  }

  // Upload a verified document against an existing placeholder
  async uploadVerifiedDocumentAgainstPlaceholder(
    documentId: string,
    file: File,
    detail: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<DocumentModel> {
    if (!file) throw new Error('File is required');

    if (!(file instanceof File)) {
      console.error('uploadVerifiedDocumentAgainstPlaceholder: invalid file object', file);
      throw new Error('Invalid file provided for upload');
    }
    if (!detail || detail.trim() === '') throw new Error('Detail is required');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('detail', detail.trim());

    const response = await this.documentService.uploadVerifiedDocumentAgainstPlaceholder(documentId, formData, onUploadProgress);
    if (!response || !response.data) throw new Error('Upload failed');
    return DocumentTransformer.toModel(response.data);
  }

  // Upload an unverified document against an existing placeholder
  async uploadUnverifiedDocumentAgainstPlaceholder(
    documentId: string,
    file: File,
    detail: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<DocumentModel> {
    if (!file) throw new Error('File is required');
    if (!detail || detail.trim() === '') throw new Error('Detail is required');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('detail', detail.trim());

    const response = await this.documentService.uploadUnverifiedDocumentAgainstPlaceholder(documentId, formData, onUploadProgress);
    if (!response || !response.data) throw new Error('Upload failed');
    return DocumentTransformer.toModel(response.data);
  }

  // Get all verified documents against appointment (GET variant)
  async getAllVerifiedDocumentsAgainstAppointmentGET(): Promise<DocumentModel[]> {
    const response = await this.documentService.getAllVerifiedDocumentsAgainstAppointmentGET();
    if (!response || !response.data || !Array.isArray(response.data)) return [];
    return DocumentTransformer.toModels(response.data);
  }
}
