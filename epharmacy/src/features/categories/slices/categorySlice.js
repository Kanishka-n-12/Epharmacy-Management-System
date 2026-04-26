import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCategories,
  fetchCategoryById,
  fetchMedicinesByCategory,
} from "./categoryThunks";

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories:        [],
    selectedCategory:  null,
    loading:           false,
    error:             null,
    categoryMedicines: [],
    categoryLoading:   false,
    categoryError:     null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => { state.loading = false; state.categories = payload; })
      .addCase(fetchCategories.rejected,  (state, { error }) => { state.loading = false; state.error = error.message; })

      .addCase(fetchCategoryById.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchCategoryById.fulfilled, (state, { payload }) => { state.loading = false; state.selectedCategory = payload; })
      .addCase(fetchCategoryById.rejected,  (state, { error }) => { state.loading = false; state.error = error.message; })

      .addCase(fetchMedicinesByCategory.pending,   (state) => { state.categoryLoading = true;  state.categoryError = null; })
      .addCase(fetchMedicinesByCategory.fulfilled, (state, { payload }) => { state.categoryLoading = false; state.categoryMedicines = payload; })
      .addCase(fetchMedicinesByCategory.rejected,  (state, { payload }) => { state.categoryLoading = false; state.categoryError = payload; });
  },
});

export default categorySlice.reducer;