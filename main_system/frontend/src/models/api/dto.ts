// Generic API response wrapper matching backend format - all API endpoints return responses wrapped in this structure
export interface ApiResponse<T> {
  data: T; // The actual response data of type T
  message: string; // Human-readable message about the response
  status: number; // HTTP status code
  success: boolean; // Whether the request was successful
}

// Structured error type for frontend error handling
export interface ErrorInfo {
  title?: string;
  message: string;
  subtitle?: string;
}

// Structured success type for frontend success handling
export interface SuccessInfo {
  title?: string;
  message: string;
  subtitle?: string;
}
