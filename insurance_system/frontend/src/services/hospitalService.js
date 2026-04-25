import api from '../config/api';

export const hospitalService = {
  getAllHospitals: async () => {
    const response = await api.get('/hospital');
    return response.data;
  },

  createHospital: async (hospitalData) => {
    const response = await api.post('/hospital', hospitalData);
    return response.data;
  },

  updateHospital: async (hospitalId, hospitalData) => {
    const response = await api.put(`/hospital/${hospitalId}`, hospitalData);
    return response.data;
  },

  deleteHospital: async (hospitalId) => {
    const response = await api.delete(`/hospital/${hospitalId}`);
    return response.data;
  },
};