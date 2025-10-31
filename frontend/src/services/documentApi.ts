import api from './api';
// TODO: Update types after model is created

export const documentApi = {
  upload: async (formData: FormData) => {
    // This endpoint and method should match backend requirements
    return api.post('/document/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
