import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { AssociatedStaffResponseDto } from '../../models/associatedStaff/dto';

export const associatedStaffService = {
  async getAssociatedStaff(): Promise<ApiResponse<AssociatedStaffResponseDto>> {
    const response = await apiClient.get<ApiResponse<AssociatedStaffResponseDto>>('/hospital/associated-staff');
    return response.data;
  }
};

export default associatedStaffService;
