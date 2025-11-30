import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  HospitalAssociationRequest, 
  CreateHospitalAssociationRequest, 
} from '../models/HospitalAssociationRequest';

export const hospitalAssociationRequestApi = {
  // GET hospital association requests for person
  getByPerson: async (): Promise<ApiResponse<HospitalAssociationRequest[]>> => {
    console.log("Fetching hospital association requests for person");
    const response = await api.get(EndPoints.hospitalAssociationRequest.getByPerson);
    console.log("Received response:", response);
    return response.data;
  },

  // GET hospital association requests for hospital staff
  getByHospital: async (): Promise<ApiResponse<HospitalAssociationRequest[]>> => {
    const response = await api.get(EndPoints.hospitalAssociationRequest.getByHospital);
    return response.data;
  },

  // POST create hospital association request
  insert: async (data: CreateHospitalAssociationRequest): Promise<ApiResponse<HospitalAssociationRequest>> => {
    const response = await api.post(EndPoints.hospitalAssociationRequest.insert, data);
    return response.data;
  },

  // POST accept hospital association request
  approve: async (hospital_association_request_id: number): Promise<ApiResponse<HospitalAssociationRequest>> => {
    const url = EndPoints.hospitalAssociationRequest.approve.replace(':hospital_association_request_id', hospital_association_request_id.toString());
    const response = await api.post(url);
    return response.data;
  },

  // DELETE hospital association request by staff
  deleteByStaff: async (hospital_association_request_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.hospitalAssociationRequest.deleteByStaff.replace(':hospital_association_request_id', hospital_association_request_id.toString());
    const response = await api.delete(url);
    return response.data;
  },

  // DELETE hospital association request by person
  deleteByPerson: async (hospital_association_request_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.hospitalAssociationRequest.deleteByPerson.replace(':hospital_association_request_id', hospital_association_request_id.toString());
    const response = await api.delete(url);
    return response.data;
  },

  // DELETE all hospital association requests by person
  deleteAllByPerson: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete(EndPoints.hospitalAssociationRequest.deleteAllByPerson);
    return response.data;
  },
};