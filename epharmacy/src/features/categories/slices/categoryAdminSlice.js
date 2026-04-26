import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCategories,
  fetchCategoryById,
  fetchMedicinesByCategory,
  addCategory,
  updateCategory,
  updateCategoryStatus,
  fetchCategoryStats,
} from "./categoryAdminThunks";

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories:        [],
    selectedCategory:  null,
    totalPages:        1,
    totalElements:     0,
    loading:           false,
    error:             null,
    categoryMedicines: [],
    categoryLoading:   false,
    categoryError:     null,
    stats:             { total: 0, active: 0, inactive: 0 },
    adminLoading:      false,
    adminError:        null,
  },
  extraReducers: (builder) => {
  builder
    .addCase(fetchCategories.pending,   (state) => { state.loading = true; state.error = null; })
    .addCase(fetchCategories.fulfilled, (state, { payload }) => {
  state.loading       = false;
  state.adminError    = null;
  state.categories    = payload.content;
  state.totalPages    = payload.totalPages;
  state.totalElements = payload.totalElements;
})
    .addCase(fetchCategories.rejected,  (state, { error }) => { state.loading = false; state.error = error.message; })

    .addCase(fetchCategoryById.pending,   (state) => { state.loading = true; state.error = null; })
    .addCase(fetchCategoryById.fulfilled, (state, { payload }) => { state.loading = false; state.selectedCategory = payload; })
    .addCase(fetchCategoryById.rejected,  (state, { error }) => { state.loading = false; state.error = error.message; })

    .addCase(fetchMedicinesByCategory.pending,   (state) => { state.categoryLoading = true;  state.categoryError = null; })
    .addCase(fetchMedicinesByCategory.fulfilled, (state, { payload }) => { state.categoryLoading = false; state.categoryMedicines = payload; })
    .addCase(fetchMedicinesByCategory.rejected,  (state, { payload }) => { state.categoryLoading = false; state.categoryError = payload; })

    .addCase(addCategory.pending,   (state) => { state.adminLoading = true;  state.adminError = null; })
    .addCase(addCategory.fulfilled, (state, { payload }) => { state.adminLoading = false; state.categories.push(payload); })
    .addCase(addCategory.rejected,  (state, { payload }) => { state.adminLoading = false; state.adminError = payload; })

    .addCase(updateCategory.pending,   (state) => { state.adminLoading = true;  state.adminError = null; })
    .addCase(updateCategory.fulfilled, (state, { payload }) => {
      state.adminLoading = false;
      const idx = state.categories.findIndex((c) => c.id === payload.id);
      if (idx !== -1) state.categories[idx] = payload;
    })
    .addCase(updateCategory.rejected,  (state, { payload }) => { state.adminLoading = false; state.adminError = payload; })

    .addCase(updateCategoryStatus.pending,   (state) => { state.adminLoading = true;  state.adminError = null; })
    .addCase(updateCategoryStatus.fulfilled, (state, { payload }) => {
      state.adminLoading = false;
      const idx = state.categories.findIndex((c) => c.id === payload.id);
      if (idx !== -1) state.categories[idx] = payload;
    })
    .addCase(updateCategoryStatus.rejected,  (state, { payload }) => { state.adminLoading = false; state.adminError = payload; })

    .addCase(fetchCategoryStats.pending,   (state) => { state.adminLoading = true;  state.adminError = null; })
    .addCase(fetchCategoryStats.fulfilled, (state, { payload }) => { state.adminLoading = false; state.stats = payload; })
    .addCase(fetchCategoryStats.rejected,  (state) => { state.adminLoading = false; state.adminError = null; });
},
});
export default categorySlice.reducer;