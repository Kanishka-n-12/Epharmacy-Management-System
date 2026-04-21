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

export const getAllCategoriesAdmin = ()=>
  api.get("/admin/categories").then((r)=>r.data);