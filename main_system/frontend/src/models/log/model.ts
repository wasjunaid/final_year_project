// Frontend models - clean structure for UI components
export interface LogModel {
  log_id: number;
  person_id: number;
  action: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  user_name: string; // Computed field for display
}
