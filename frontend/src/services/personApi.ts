import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  Person, 
  UpdatePersonRequest
} from '../models/Person';

export const personApi = {
  // GET /person
  get: async (): Promise<ApiResponse<Person>> => {
    const response = await api.get(EndPoints.person.get);
    return response.data;
  },

  // PUT /person
  update: async (data: UpdatePersonRequest): Promise<ApiResponse<Person>> => {
    const response = await api.put(EndPoints.person.update, data);
    return response.data;
  },

  // DELETE /person
  delete: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete(EndPoints.person.delete);
    return response.data;
  },
};