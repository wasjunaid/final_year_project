import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api';
import type { HospitalPanelListDto } from '../../models/hospitalPanelList/dto';
import type { CreateHospitalPanelListPayload } from '../../models/hospitalPanelList/payload';

export const hospitalPanelListService = {
  async getAllHospitalPanelList(): Promise<ApiResponse<HospitalPanelListDto[]>> {
    const response = await apiClient.get<ApiResponse<HospitalPanelListDto[]>>('/hospital-panel-list');
    return response.data;
  },

  async createHospitalPanelList(payload: CreateHospitalPanelListPayload): Promise<ApiResponse<HospitalPanelListDto>> {
    const response = await apiClient.post<ApiResponse<HospitalPanelListDto>>('/hospital-panel-list', payload);
    return response.data;
  },

  async deleteHospitalPanelList(hospitalPanelListId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/hospital-panel-list/${hospitalPanelListId}`);
    return response.data;
  },
};
