import api from '../config/api';

export const claimService = {
  getAllClaims: async () => {
    const response = await api.get('/claim');
    return response.data;
  },

  createClaim: async (claimData) => {
    const response = await api.post('/claim', claimData);
    return response.data;
  },

  updateClaimStatus: async (claimId, statusData) => {
    const response = await api.put(`/claim/${claimId}`, statusData);
    return response.data;
  },
};