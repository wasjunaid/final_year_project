import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api';
import type { LogDto } from '../../models/log/dto';

// Log service - pure HTTP helpers returning DTOs wrapped in ApiResponse
export const logService = {
  async getAllLogs(): Promise<ApiResponse<LogDto[]>> {
    const response = await apiClient.get<ApiResponse<LogDto[]>>('/log');
    return response.data;
  },
};
