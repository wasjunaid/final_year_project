import api from '../config/api';

export const personService = {
  getAllPersons: async () => {
    const response = await api.get('/person');
    return response.data;
  },

  createPerson: async (personData) => {
    const response = await api.post('/person', personData);
    return response.data;
  },

  // Person Insurance endpoints
  getAllPersonInsurances: async () => {
    const response = await api.get('/person-insurance');
    return response.data;
  },

  createPersonInsurance: async (personInsuranceData) => {
    const response = await api.post('/person-insurance', personInsuranceData);
    return response.data;
  },

  deletePersonInsurance: async (personInsuranceId) => {
    const response = await api.delete(`/person-insurance/${personInsuranceId}`);
    return response.data;
  },
};