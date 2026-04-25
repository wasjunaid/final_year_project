import type { LogModel } from '../../models/log/model';
import { toLogModels } from '../../models/log/transformers';
import { AppError } from '../../utils/appError';
import type { LogQueryParams } from '../../services/log/logService';

export interface LogsResult {
  logs: LogModel[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  } | null;
}

// Factory to create log repository with DI for service
export const createLogRepository = ({ logService }: { logService: any }) => {
  return {
    async getAllLogs(params: LogQueryParams = {}): Promise<LogsResult> {
      try {
        const response = await logService.getAllLogs(params);
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to fetch logs',
            title: 'Fetch Failed'
          });
        }

        return {
          logs: toLogModels(response.data || []),
          pagination: response.pagination ?? null,
        };
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch logs';
        throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
      }
    },
  };
};
