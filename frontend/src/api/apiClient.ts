// Generated: Auth feature — follow DI + repository + zustand factory pattern

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

/**
 * Create axios instance with baseURL from environment or fallback to /api
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to attach Authorization header from localStorage
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to normalize errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const message = 
      (error.response?.data as any)?.message || 
      error.message || 
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
