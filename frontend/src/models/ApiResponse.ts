export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}

// export interface ApiError {
//   message: string;
//   status: number;
// }

// export interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   pageSize: number;
// }

// export interface PaginatedRequest {
//   page?: number;
//   pageSize?: number;
// }
