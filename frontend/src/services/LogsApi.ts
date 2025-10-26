import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  Log, 
} from '../models/Log';

export const logsApi = {
  // GET /log
  getAll: async (): Promise<ApiResponse<Log[]>> => {
    const response = await api.get(EndPoints.logs.getAll);
    return response.data;
  },
};