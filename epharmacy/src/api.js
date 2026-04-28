import axios from "axios";
import { store } from "./store";
import { clearAuth } from "./features/auth/slice/authSlice";
import { getRoleFromToken } from "./features/auth/services/authService";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("phone");
  localStorage.removeItem("role");
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue  = [];
const base = "/auth";

function processQueue(error, token = null) {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(
        `${api.defaults.baseURL}${base}/refresh`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );

      localStorage.setItem("accessToken", data.accessToken);
      const role = getRoleFromToken(data.accessToken);
      localStorage.setItem("role", role);

      api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
      originalRequest.headers.Authorization        = `Bearer ${data.accessToken}`;
      processQueue(null, data.accessToken);

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      store.dispatch(clearAuth());
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;  
    }
  }
);

export default api;