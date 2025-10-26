import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  HospitalPanelList, 
  CreateHospitalPanelListRequest, 
} from '../models/HospitalPanelList';

export const hospitalPannelListApi = {
  // GET /hospital-panel-list
  getAll: async (): Promise<ApiResponse<HospitalPanelList[]>> => {
    const response = await api.get(EndPoints.hospitalPannelList.getAll);
    return response.data;
  },

  // POST /hospital-panel-list
  insert: async (data: CreateHospitalPanelListRequest): Promise<ApiResponse<HospitalPanelList>> => {
    const response = await api.post(EndPoints.hospitalPannelList.insert, data);
    return response.data;
  },

  // DELETE /hospital-panel-list/:hospital_pannel_list_id
  delete: async (hospital_pannel_list_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.hospitalPannelList.delete.replace(':hospital_pannel_list_id', hospital_pannel_list_id.toString());
    const response = await api.delete(url);
    return response.data;
  },
};