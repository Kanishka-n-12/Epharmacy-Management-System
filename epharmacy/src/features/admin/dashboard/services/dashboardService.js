import axios from "axios";
import { getAccessToken } from "../../../auth/services/authService";

const BASE = "http://localhost:8080/api/admin/dashboard";

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        const { accessToken } = await refreshAccessToken();
        err.config.headers.Authorization = `Bearer ${accessToken}`;
        return api.request(err.config);
      } catch {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const fetchStats            = () => api.get("/stats").then(r => r.data);
export const fetchMonthlyRevenue   = () => api.get("/charts/monthly-revenue").then(r => r.data);
export const fetchCategorySales    = () => api.get("/charts/sales-by-category").then(r => r.data);
export const fetchWeeklyOrders     = () => api.get("/charts/daily-orders").then(r => r.data);
export const fetchUserStats        = () => api.get("/charts/user-trends").then(r => r.data);