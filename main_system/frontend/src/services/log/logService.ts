import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api';
import type { LogDto } from '../../models/log/dto';

export interface LogQueryParams {
  search?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface LogsApiResponse extends ApiResponse<LogDto[]> {
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  } | null;
}

// Log service - pure HTTP helpers returning DTOs wrapped in ApiResponse
export const logService = {
  async getAllLogs(params: LogQueryParams = {}): Promise<LogsApiResponse> {
    const response = await apiClient.get<LogsApiResponse>('/log', { params });
    return response.data;
  },
};
