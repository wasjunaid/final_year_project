import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  Document, 
  DocumentUploadRequest,
  VerifiedDocumentUploadRequest,
  DocumentsResponse,
  AppointmentDocumentsParams
} from '../models/Document';

export const documentApi = {
  // GET /document/:document_id - Get a specific document
  getById: async (document_id: number): Promise<ApiResponse<Document>> => {
    const url = EndPoints.document.get.replace(':document_id', document_id.toString());
    const response = await api.get(url);
    return response.data;
  },

  // GET /document/unverified - Get all unverified documents
  getUnverified: async (): Promise<ApiResponse<Document[]>> => {
    const response = await api.get(EndPoints.document.getUnverified);
    return response.data;
  },

  // GET /document/verified - Get all verified documents
  getVerified: async (): Promise<ApiResponse<Document[]>> => {
    const response = await api.get(EndPoints.document.getVerified);
    return response.data;
  },

  // GET /document/all - Get all documents (verified and unverified)
  getAll: async (): Promise<ApiResponse<DocumentsResponse>> => {
    const response = await api.get(EndPoints.document.getAll);
    return response.data;
  },

  // GET /document/appointment - Get all verified documents against an appointment
  getAgainstAppointment: async (params: AppointmentDocumentsParams): Promise<ApiResponse<Document[]>> => {
    const response = await api.get(EndPoints.document.getAgainstAppointment, {
      params: params,
    });
    return response.data;
  },

  // POST /document/upload/unverified - Upload an unverified document (by patient)
  uploadUnverified: async (data: DocumentUploadRequest): Promise<ApiResponse<Document>> => {
    const formData = new FormData();
    
    // Append file first with explicit filename
    formData.append('file', data.file, data.file.name);
    
    // IMPORTANT: Send all file metadata explicitly as separate fields
    // These match what the backend expects
    formData.append('originalname', data.file.name);
    formData.append('filename', data.file.name);
    formData.append('mimetype', data.file.type);
    formData.append('filepath', data.file.name);
    formData.append('size', data.file.size.toString());
    formData.append('filesize', data.file.size.toString());
    
    // Append document fields
    formData.append('document_type', data.document_type);
    formData.append('detail', data.detail);
    
    // uploaded_for is required, default to SELF
    formData.append('uploaded_for', data.uploaded_for || 'SELF');
    
    // Optional fields
    if (data.appointment_id) {
      formData.append('appointment_id', data.appointment_id.toString());
    }
    
    if (data.lab_test_id) {
      formData.append('lab_test_id', data.lab_test_id.toString());
    }

    // Log FormData contents for debugging
    console.log('Uploading with FormData:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await api.post(EndPoints.document.uploadUnverified, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
    });
    return response.data;
  },

  // POST /document/upload/verified - Upload a verified document (by lab technician)
  uploadVerified: async (data: VerifiedDocumentUploadRequest): Promise<ApiResponse<Document>> => {
    const formData = new FormData();
    
    // Append file first with explicit filename
    formData.append('file', data.file, data.file.name);
    
    // IMPORTANT: Send all file metadata explicitly as separate fields
    // These match what the backend expects
    formData.append('originalname', data.file.name);
    formData.append('filename', data.file.name);
    formData.append('mimetype', data.file.type);
    formData.append('filepath', data.file.name);
    formData.append('size', data.file.size.toString());
    formData.append('filesize', data.file.size.toString());
    
    // Append document fields
    formData.append('document_type', data.document_type);
    formData.append('detail', data.detail);
    formData.append('uploaded_for', data.uploaded_for);
    formData.append('patient_id', data.patient_id.toString());
    
    // Optional fields
    if (data.appointment_id) {
      formData.append('appointment_id', data.appointment_id.toString());
    }
    
    if (data.lab_test_id) {
      formData.append('lab_test_id', data.lab_test_id.toString());
    }

    // Log FormData contents for debugging
    console.log('Uploading verified document with FormData:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await api.post(EndPoints.document.uploadVerified, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
    });
    return response.data;
  },

  // GET /document/download/:document_id - Download a document
  downloadDocument: async (document_id: number): Promise<Blob> => {
    const url = EndPoints.document.download.replace(':document_id', document_id.toString());
    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Helper function to trigger download in browser
  downloadAndSave: async (document_id: number, filename: string): Promise<void> => {
    try {
      const blob = await documentApi.downloadDocument(document_id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  },
};
