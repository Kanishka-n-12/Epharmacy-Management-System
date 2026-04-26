import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCategories, getCategoryById, getMedicinesByCategory } from "../services/categoryService";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const data = await getAllCategories();
    return data;
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
      const data = await getMedicinesByCategory(categorySlug);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);