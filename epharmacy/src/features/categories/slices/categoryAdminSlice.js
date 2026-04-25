import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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
      return await getAllCategoriesAdmin(page, size);
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
      return await getCategoryStatsAdmin();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);


const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    selectedCategory: null,
    totalPages: 1,        
  totalElements: 0, 
    loading: false,
    error: null,
    categoryMedicines: [],
    categoryLoading: false,
    categoryError: null,

    stats: { total: 0, active: 0, inactive: 0 },
    adminLoading: false,
    adminError: null,
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
  state.loading = false;
  state.categories = payload.content ?? payload ?? []; 
  state.totalPages = payload.totalPages ?? 1;
  state.totalElements = payload.totalElements ?? 0;
})
      .addCase(fetchCategories.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })

      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedCategory = payload;
      })
      .addCase(fetchCategoryById.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })

      /* ── fetchMedicinesByCategory ── */
      .addCase(fetchMedicinesByCategory.pending, (state) => {
        state.categoryLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchMedicinesByCategory.fulfilled, (state, { payload }) => {
        state.categoryLoading = false;
        state.categoryMedicines = payload;
      })
      .addCase(fetchMedicinesByCategory.rejected, (state, { payload }) => {
        state.categoryLoading = false;
        state.categoryError = payload;
      })

      /* ── addCategory (admin) ── */
      .addCase(addCategory.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(addCategory.fulfilled, (state, { payload }) => {
        state.adminLoading = false;
        state.categories.push(payload); // optimistic local update
      })
      .addCase(addCategory.rejected, (state, { payload }) => {
        state.adminLoading = false;
        state.adminError = payload;
      })

      /* ── updateCategory (admin) ── */
      .addCase(updateCategory.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        state.adminLoading = false;
        const idx = state.categories.findIndex((c) => c.id === payload.id);
        if (idx !== -1) state.categories[idx] = payload;
      })
      .addCase(updateCategory.rejected, (state, { payload }) => {
        state.adminLoading = false;
        state.adminError = payload;
      })

      /* ── updateCategoryStatus (admin) ── */
      .addCase(updateCategoryStatus.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(updateCategoryStatus.fulfilled, (state, { payload }) => {
        state.adminLoading = false;
        const idx = state.categories.findIndex((c) => c.id === payload.id);
        if (idx !== -1) state.categories[idx] = payload;
      })
      .addCase(updateCategoryStatus.rejected, (state, { payload }) => {
        state.adminLoading = false;
        state.adminError = payload;
      })

      /* ── fetchCategoryStats (admin) ── */
      .addCase(fetchCategoryStats.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchCategoryStats.fulfilled, (state, { payload }) => {
        state.adminLoading = false;
        state.stats = payload; // { total, active, inactive } from CategoryStatsDTO
      })
      .addCase(fetchCategoryStats.rejected, (state, { payload }) => {
        state.adminLoading = false;
        state.adminError = payload;
      });
  },
});

export default categorySlice.reducer;