// Document Service - Handles all document-related API calls

import apiClient from "../apiClient";
import type {
  GetAllVerifiedDocumentsAgainstAppointmentPayload,
  UploadUnverifiedDocumentResponseDto,
  UploadVerifiedDocumentResponseDto,
  GetDocumentResponseDto,
  GetAllDocumentsResponseDto,
  GetAllVerifiedDocumentsAgainstAppointmentResponseDto
} from "../../models/document";
import type { InsertPlaceholderPayload } from "../../models/document";

export class DocumentService {

  /**
   * Get a single document by ID
   */
  static async getDocument(documentId: string): Promise<GetDocumentResponseDto> {
    const response = await apiClient.get<GetDocumentResponseDto>(`/document/${documentId}`);
    return response.data;
  }

  /**
   * Get all unverified documents for the current patient
   */
  static async getAllUnverifiedDocuments(): Promise<GetAllDocumentsResponseDto> {
    const response = await apiClient.get<GetAllDocumentsResponseDto>(`/document/unverified`);
    return response.data;
  }

  /**
   * Get all verified documents for the current patient
   */
  static async getAllVerifiedDocuments(): Promise<GetAllDocumentsResponseDto> {
    const response = await apiClient.get<GetAllDocumentsResponseDto>(`/document/verified`);
    return response.data;
  }

  /**
   * Get all documents (verified + unverified) for the current patient
   */
  static async getAllDocuments(): Promise<GetAllDocumentsResponseDto> {
    const response = await apiClient.get<GetAllDocumentsResponseDto>(`/document/all`);
    return response.data;
  }

  /**
   * Get all verified documents for a specific appointment
   */
  static async getAllVerifiedDocumentsAgainstAppointment(
    payload: GetAllVerifiedDocumentsAgainstAppointmentPayload
  ): Promise<GetAllVerifiedDocumentsAgainstAppointmentResponseDto> {
    const response = await apiClient.post<GetAllVerifiedDocumentsAgainstAppointmentResponseDto>(`/document/verified/appointment`, payload);
    return response.data;
  }

  /**
   * Upload an unverified document (patient uploads)
   * @param formData - FormData containing the file and metadata (document_type, detail)
   * @param onUploadProgress - Optional callback to track upload progress
   */
  static async uploadUnverifiedDocument(
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<UploadUnverifiedDocumentResponseDto> {
    const response = await apiClient.post<UploadUnverifiedDocumentResponseDto>(
      `/document/upload/unverified`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    return response.data;
  }

  /**
   * Upload a verified document (doctor/lab tech uploads)
   * Expects a FormData containing the file and optional metadata (file, detail, patient_id, appointment_id, lab_test_id)
   */
  static async uploadVerifiedDocument(
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<UploadVerifiedDocumentResponseDto> {
    const response = await apiClient.post<UploadVerifiedDocumentResponseDto>(
      `/document/upload/verified`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    return response.data;
  }

  /**
   * Download a document
   * Returns a Blob URL that can be used to download the file
   */
  static async downloadDocument(documentId: string): Promise<string> {
    const response = await apiClient.get(
      `/document/download/${documentId}`,
      { responseType: "blob" }
    );
    const blob = response.data;
    return URL.createObjectURL(blob);
  }

  /**
   * Get document placeholders for patient (lab test documents)
   */
  static async getPlaceholdersForPatient() {
    const response = await apiClient.get<GetAllDocumentsResponseDto>(`/document/placeholders-for-patient`);
    return response.data;
  }

  /**
   * Get document placeholders for lab technician
   */
  static async getPlaceholdersForLabTech() {
    const response = await apiClient.get<GetAllDocumentsResponseDto>(`/document/placeholders-for-lab-tech`);
    return response.data;
  }

  /**
   * Insert placeholder for lab test document (doctor)
   */
  static async insertPlaceholderForLabTestDocument(payload: InsertPlaceholderPayload): Promise<UploadVerifiedDocumentResponseDto> {
    const response = await apiClient.post<UploadVerifiedDocumentResponseDto>(`/document/placeholder`, payload);
    return response.data;
  }

  /**
   * Delete a document by ID
   */
  static async deleteDocument(documentId: string) {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(`/document/${documentId}`);
    return response.data;
  }

  /**
   * Upload verified document against placeholder (lab technician)
   */
  static async uploadVerifiedDocumentAgainstPlaceholder(
    documentId: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ) {
    const response = await apiClient.put<UploadVerifiedDocumentResponseDto>(
      `/document/upload/verified/${documentId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      }
    );
    return response.data;
  }

  /**
   * Upload unverified document against placeholder (patient)
   */
  static async uploadUnverifiedDocumentAgainstPlaceholder(
    documentId: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ) {
    const response = await apiClient.put<UploadUnverifiedDocumentResponseDto>(
      `/document/upload/unverified/${documentId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      }
    );
    return response.data;
  }

  /**
   * Get all verified documents against appointment (GET version)
   */
  static async getAllVerifiedDocumentsAgainstAppointmentGET() {
    const response = await apiClient.get<GetAllDocumentsResponseDto>(
      `/document/appointment`
    );
    return response.data;
  }
}
