// Document Repository - Business logic and validation layer

import { DocumentService } from "../../services/document";
import {
  DocumentModel,
  DocumentTransformer
} from "../../models/document";
import type {
  GetAllVerifiedDocumentsAgainstAppointmentPayload
} from "../../models/document";

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
  async getAllUnverifiedDocuments(): Promise<DocumentModel[]> {
    const response = await this.documentService.getAllUnverifiedDocuments();
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("Invalid response structure for unverified documents:", response);
      return [];
    }
    return DocumentTransformer.toModels(response.data);
  }

  //Get all verified documents
  async getAllVerifiedDocuments(): Promise<DocumentModel[]> {
    const response = await this.documentService.getAllVerifiedDocuments();
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("Invalid response structure for verified documents:", response);
      return [];
    }
    return DocumentTransformer.toModels(response.data);
  }

  //Get all documents (verified + unverified)
  async getAllDocuments(): Promise<DocumentModel[]> {
    const response = await this.documentService.getAllDocuments();
    
    if (!response || !response.data) {
      console.error("Invalid response structure for all documents:", response);
      return [];
    }
    
    // Backend returns: { data: { unverified: [...], verified: [...] } }
    // Combine both arrays
    const data = response.data as { unverified?: any[], verified?: any[] };
    const allDocuments = [
      ...(Array.isArray(data.unverified) ? data.unverified : []),
      ...(Array.isArray(data.verified) ? data.verified : [])
    ];
    
    return DocumentTransformer.toModels(allDocuments);
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
}
