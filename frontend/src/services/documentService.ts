import api from '../services/api';
import type { Document } from '../models/Document';

export async function fetchAllDocuments(): Promise<{ verified_documents: Document[]; unverified_documents: Document[] }> {
  // TODO: Update endpoint to match backend
  const res = await api.get('/document');
  return res.data.data;
}

export async function fetchDocumentById(documentId: string): Promise<Document | null> {
  // TODO: Update endpoint to match backend
  const res = await api.get(`/document/${documentId}`);
  return res.data.data || null;
}
