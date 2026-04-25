import api from '../config/api';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/user');
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/user/${userId}`);
    return response.data;
  },
};