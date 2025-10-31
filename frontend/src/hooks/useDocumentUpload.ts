import { useState } from 'react';
import { documentApi } from '../services/documentApi';
import type { DocumentUploadRequest } from '../models/Document';

export function useDocumentUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const upload = async (payload: DocumentUploadRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('document_type', payload.document_type);
      formData.append('detail', payload.detail);
      if (payload.uploaded_for) formData.append('uploaded_for', payload.uploaded_for);
      if (payload.appointment_id) formData.append('appointment_id', payload.appointment_id);
      if (payload.lab_test_id) formData.append('lab_test_id', payload.lab_test_id);
      await documentApi.upload(formData);
      setSuccess('Document uploaded successfully!');
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return { upload, loading, error, success, clearMessages };
}
