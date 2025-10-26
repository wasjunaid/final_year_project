export interface Log {
  log_id: number;
  person_id: number;
  role: string;
  action: string;
  table_name: string;
  record_id: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  timestamp: string;
  // Extended fields
  person_name?: string;
  person_email?: string;
}
