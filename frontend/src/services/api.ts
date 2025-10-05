import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import ROUTES from "../constants/routes";
import EndPoints from "../constants/endpoints";
import StatusCodes from "../constants/StatusCodes";
import { tokenService } from "./tokenService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token to each request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenService.getAccessToken();

  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor to handle 401 (expired token)
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === StatusCodes.UNAUTHORIZED &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = tokenService.getRefreshToken();

      if (!refreshToken) {
        tokenService.clearTokens();
        window.location.href = ROUTES.AUTH.SIGN_IN;
        return Promise.reject(error);
      }

      try {
        const res = await api.post(EndPoints.auth.refreshToken, {
          refreshToken,
        });

        const newAccessToken = res.data.data.accessToken;
        const newRefreshToken = res.data.data.refreshToken;

        if (!newAccessToken) throw new Error("No access token in refresh");

        tokenService.setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken ?? refreshToken,
        });

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        console.error("Error refreshing token:", err);
        tokenService.clearTokens();
        window.location.href = ROUTES.AUTH.SIGN_IN;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
