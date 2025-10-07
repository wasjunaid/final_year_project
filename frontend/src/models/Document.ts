export interface Document {
  document_id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  detail: string;
  document_type?: string;
  uploaded_by_first_name?: string;
  uploaded_by_last_name?: string;
  lab_test_name?: string;
  lab_test_description?: string;
  lab_test_cost?: number;
}
