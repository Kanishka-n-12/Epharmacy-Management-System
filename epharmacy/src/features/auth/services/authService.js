// auth/services/authService.js
import axios from "axios";
import { store } from "../../../store";
import { clearAuth } from "../slice/authSlice";
import api from "../../../api";

const base = "/auth";


function saveTokens({ accessToken, refreshToken, phone }) {
  localStorage.setItem("accessToken",  accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("phone",        phone);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("phone");
  localStorage.removeItem("role");
}

function getRoleFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export const getAccessToken  = () => localStorage.getItem("accessToken");
export const getRole         = () => localStorage.getItem("role");
export const getPhone        = () => localStorage.getItem("phone");
export const isAuthenticated = () => !!localStorage.getItem("accessToken");


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


let isRefreshing = false;
let failedQueue  = [];

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
    isRefreshing           = true;

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


export async function loginApi({ phone, password }) {
  const { data } = await api.post(base + "/login", { phone, password });
  const role = getRoleFromToken(data.accessToken);
  saveTokens(data);
  localStorage.setItem("role", role);
  return { ...data, role };
}

export async function registerApi({ phone, password, name, email }) {
  const { data } = await api.post(base + "/register", { phone, password, name, email });
  return data;
}

export async function logoutApi() {
  try {
    await api.post(base + "/logout");
  } finally {
    clearTokens();
  }
}

export async function forgotPasswordApi(phone) {
  const { data } = await api.post(base + "/forgot-password", { phone });
  return data;
}

export async function resetPasswordApi({ phone, otp, newPassword }) {
  const { data } = await api.post(base + "/reset-password", { phone, otp, newPassword });
  return data;
}