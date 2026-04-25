import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { PersonDTO } from '../../models/profile';
import type { UpdatePersonRequest } from '../../models/profile/payload';

// Profile service - pure HTTP helpers returning DTOs wrapped in ApiResponse
export const personProfileService = {
  // Get - fetch person profile
  async getPerson(): Promise<ApiResponse<PersonDTO>> {
    const response = await apiClient.get<ApiResponse<PersonDTO>>('/person');
    return response.data;
  },

  // PUT - update person profile
  async updatePerson(data: UpdatePersonRequest): Promise<ApiResponse<PersonDTO>> {
    const response = await apiClient.put<ApiResponse<PersonDTO>>('/person', data);
    return response.data;
  },
};
