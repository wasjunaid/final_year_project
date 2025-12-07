import type { LogModel } from '../../models/log/model';
import { toLogModels } from '../../models/log/transformers';
import { AppError } from '../../utils/appError';

// Factory to create log repository with DI for service
export const createLogRepository = ({ logService }: { logService: any }) => {
  return {
    async getAllLogs(): Promise<LogModel[]> {
      try {
        const response = await logService.getAllLogs();
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to fetch logs',
            title: 'Fetch Failed'
          });
        }

        return toLogModels(response.data || []);
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
