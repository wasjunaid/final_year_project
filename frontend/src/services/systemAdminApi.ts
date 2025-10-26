import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  SystemAdmin, 
  CreateSystemAdminRequest, 
} from '../models/SystemAdmin';

export const systemAdminApi = {
  // GET /system-admin
  getAll: async (): Promise<ApiResponse<SystemAdmin[]>> => {
    const response = await api.get(EndPoints.systemAdmin.getAll);
    return response.data;
  },

  // POST /system-admin
  insert: async (data: CreateSystemAdminRequest): Promise<ApiResponse<SystemAdmin>> => {
    const response = await api.post(EndPoints.systemAdmin.insert, data);
    return response.data;
  },

  // DELETE /system-admin/:system_admin_id
  delete: async (system_admin_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.systemAdmin.delete.replace(':system_admin_id', system_admin_id.toString());
    const response = await api.delete(url);
    return response.data;
  },
};