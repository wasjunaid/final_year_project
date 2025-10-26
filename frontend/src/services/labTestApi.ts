import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  LabTest, 
  CreateLabTestRequest, 
  UpdateLabTestRequest
} from '../models/LabTest';

export const labTestApi = {
  // GET /lab-test
  get: async (): Promise<ApiResponse<LabTest[]>> => {
    const response = await api.get(EndPoints.labTest.get);
    return response.data;
  },

  // POST /lab-test
  insert: async (data: CreateLabTestRequest): Promise<ApiResponse<LabTest>> => {
    const response = await api.post(EndPoints.labTest.insert, data);
    return response.data;
  },

  // PUT /lab-test/:lab_test_id
  update: async (lab_test_id: number, data: UpdateLabTestRequest): Promise<ApiResponse<LabTest>> => {
    const url = EndPoints.labTest.update.replace(':lab_test_id', lab_test_id.toString());
    const response = await api.put(url, data);
    return response.data;
  },
};