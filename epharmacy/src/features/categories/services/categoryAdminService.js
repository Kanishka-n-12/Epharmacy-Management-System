import axios from "axios";
import api from "../../../api";

export const addCategoryAdmin = (payload) =>
  api.post("/admin/categories", payload).then((r) => r.data);

export const updateCategoryAdmin = (id, payload) =>
  api.put(`/admin/categories/${id}`, payload).then((r) => r.data);

export const updateCategoryStatusAdmin = (id, status) =>
  api.patch(`/admin/categories/${id}/status`, { status }).then((r) => r.data);

export const getCategoryStatsAdmin = () =>
  api.get("/admin/categories/stats").then((r) => r.data);

export const getAllCategoriesAdmin = (page = 0, size = 10, search = "", status = "") => {
  const params = new URLSearchParams({ page, size });
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  return api.get(`/admin/categories?${params}`).then((r) => r.data);
};