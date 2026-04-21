import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCategories, getCategoryById, getMedicinesByCategory } from "../services/categoryService";
import axios from "axios";

 
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

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    selectedCategory: null,
    loading: false,
    error: null,
    categoryMedicines: [],
categoryLoading: false,
categoryError: null,
  },
  extraReducers: (builder) => {
    builder
       
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

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

       
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      ;
  },
});

export default categorySlice.reducer;