import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import ROUTES from '../constants/routes';
import StatusCodes from '../constants/statusCodes';


// Token management utilities
// Reads from Zustand's persisted auth-storage

export const tokenManager = {
  getAccessToken: () => {
    try {
      // Check sessionStorage first, then localStorage
      let authStorage = sessionStorage.getItem('auth-storage');
      if (!authStorage) {
        authStorage = localStorage.getItem('auth-storage');
      }
      if (!authStorage) return null;
      const parsed = JSON.parse(authStorage);
      return parsed.state?.accessToken || null;
    } catch {
      return null;
    }
  },
  getRefreshToken: () => {
    try {
      // Check sessionStorage first, then localStorage
      let authStorage = sessionStorage.getItem('auth-storage');
      if (!authStorage) {
        authStorage = localStorage.getItem('auth-storage');
      }
      if (!authStorage) return null;
      const parsed = JSON.parse(authStorage);
      return parsed.state?.refreshToken || null;
    } catch {
      return null;
    }
  },
  clearTokens: () => {
    try {
      sessionStorage.removeItem('auth-storage');
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('auth-remember-me');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },
};

// Create axios instance with baseURL from environment or fallback
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Authorization header from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 (expired token)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    // Only redirect to login if it's NOT an auth endpoint (login/signup)
    // Auth endpoints return 401 for invalid credentials, which should be handled by the UI
    if (error.response?.status === StatusCodes.UNAUTHORIZED) {
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/sign-in') || 
                             originalRequest?.url?.includes('/auth/sign-up');
      
      if (!isAuthEndpoint) {
        // Token expired - clear and redirect
        tokenManager.clearTokens();
        window.location.href = ROUTES.AUTH.SIGN_IN;
      }
      
      // For auth endpoints, let the error propagate so UI can display it
      return Promise.reject(error);
    }

    // For other errors, just reject with the original axios error
    // This preserves error.response.data for downstream handlers
    return Promise.reject(error);
  }
);

export default apiClient;
