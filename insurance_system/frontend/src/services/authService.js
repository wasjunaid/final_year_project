import api from '../config/api';

export const authService = {
  signIn: async (email, password, role) => {
    const response = await api.post('/auth/sign-in', { email, password, role });
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-jwt', { refreshToken });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};