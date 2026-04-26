import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCategoryById } from "../services/categoryService";
import {
  addCategoryAdmin,
  updateCategoryAdmin,
  updateCategoryStatusAdmin,
  getCategoryStatsAdmin,
  getAllCategoriesAdmin,
} from "../services/categoryAdminService";
import axios from "axios";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await getAllCategoriesAdmin(page, size);
      return {
        content:       data.content       ?? [],
        totalPages:    data.totalPages    ?? 1,
        totalElements: data.totalElements ?? 0,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (id) => {
    const data = await getCategoryById(id);
    return data;
  }
);

export const fetchMedicinesByCategory = createAsyncThunk(
  "categories/fetchMedicinesByCategory",
  async (categorySlug, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `http://localhost:8080/api/medicines/by-category/${categorySlug}`
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async (payload, { rejectWithValue }) => {
    try {
      return await addCategoryAdmin(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateCategoryAdmin(id, payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const updateCategoryStatus = createAsyncThunk(
  "categories/updateCategoryStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await updateCategoryStatusAdmin(id, status);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchCategoryStats = createAsyncThunk(
  "categories/fetchCategoryStats",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCategoryStatsAdmin();
      console.log("=== stats response:", data);
      return data;
    } catch (err) {
      console.log("=== stats error:", err.response?.status, err.response?.data);
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);