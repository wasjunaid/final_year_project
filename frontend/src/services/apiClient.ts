import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "/api",
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const message = err.response?.data?.message || err.message || "Network error";
    return Promise.reject(new Error(message));
  }
);

export default api;
