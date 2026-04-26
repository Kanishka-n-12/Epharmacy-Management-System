import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNewLaunches,
  fetchAllMedicines,
  fetchAllMedicinesForAdmin,
  fetchMedicineById,
  fetchCategories,
  fetchMedicineStats,
  createMedicine,
  editMedicine,
  changeMedicineAvailability,
  fetchBatches,
  createBatch,
  editBatch,
  removeBatch,
} from "./medicineThunks";

const medicineSlice = createSlice({
  name: "medicines",
  initialState: {
  newLaunches:      [],
  allMedicines:     [],
  adminMedicines:   [],
  totalPages:       1,
  totalElements:    0,
  stats:            null,
  batchMap:         {},
  categories:       [],
  selectedMedicine: null,
  loading:          false,
  adminLoading:     false,
  detailLoading:    false,
  error:            null,
  adminError:       null,
  detailError:      null,
},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewLaunches.pending,   (s)       => { s.loading = true;  s.error = null; })
      .addCase(fetchNewLaunches.fulfilled, (s, { payload }) => { s.loading = false; s.newLaunches = payload; })
      .addCase(fetchNewLaunches.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

      .addCase(fetchAllMedicines.pending,   (s)       => { s.loading = true;  s.error = null; })
      .addCase(fetchAllMedicines.fulfilled, (s, { payload }) => { s.loading = false; s.allMedicines = payload; s.adminMedicines = payload; })
      .addCase(fetchAllMedicines.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

      .addCase(fetchAllMedicinesForAdmin.pending,   (s)       => { s.loading = true;  s.error = null; })
      .addCase(fetchAllMedicinesForAdmin.fulfilled, (s, { payload }) => {
  s.loading       = false;
  s.adminMedicines = payload.content;
  s.totalPages    = payload.totalPages;
  s.totalElements = payload.totalElements;
})
      .addCase(fetchAllMedicinesForAdmin.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

      .addCase(fetchMedicineById.pending,   (s)       => { s.detailLoading = true;  s.detailError = null; s.selectedMedicine = null; })
      .addCase(fetchMedicineById.fulfilled, (s, { payload }) => { s.detailLoading = false; s.selectedMedicine = payload; })
      .addCase(fetchMedicineById.rejected,  (s, { payload }) => { s.detailLoading = false; s.detailError = payload; })

      .addCase(fetchCategories.pending,   (s)       => { s.adminLoading = true; })
      .addCase(fetchCategories.fulfilled, (s, { payload }) => { s.adminLoading = false; s.categories = payload; })
      .addCase(fetchCategories.rejected,  (s, { payload }) => { s.adminLoading = false; s.adminError = payload; })

      .addCase(fetchMedicineStats.pending,   (s)       => { s.adminLoading = true; })
      .addCase(fetchMedicineStats.fulfilled, (s, { payload }) => { s.adminLoading = false; s.stats = payload; })
      .addCase(fetchMedicineStats.rejected,  (s, { payload }) => { s.adminLoading = false; s.adminError = payload; })

      .addCase(createMedicine.pending,   (s)       => { s.adminLoading = true;  s.adminError = null; })
      .addCase(createMedicine.fulfilled, (s, { payload }) => {
        s.adminLoading = false;
        s.adminMedicines.push(payload);
        s.allMedicines.push(payload);
      })
      .addCase(createMedicine.rejected,  (s, { payload }) => { s.adminLoading = false; s.adminError = payload; })

      .addCase(editMedicine.pending,   (s)       => { s.adminLoading = true;  s.adminError = null; })
      .addCase(editMedicine.fulfilled, (s, { payload }) => {
        s.adminLoading = false;
        const update = (arr) => { const i = arr.findIndex((m) => m.id === payload.id); if (i !== -1) arr[i] = payload; };
        update(s.adminMedicines);
        update(s.allMedicines);
      })
      .addCase(editMedicine.rejected,  (s, { payload }) => { s.adminLoading = false; s.adminError = payload; })

      .addCase(changeMedicineAvailability.pending,   (s)       => { s.adminLoading = true;  s.adminError = null; })
      .addCase(changeMedicineAvailability.fulfilled, (s, { payload }) => {
        s.adminLoading = false;
        const update = (arr) => { const i = arr.findIndex((m) => m.id === payload.id); if (i !== -1) arr[i] = payload; };
        update(s.adminMedicines);
        update(s.allMedicines);
      })
      .addCase(changeMedicineAvailability.rejected,  (s, { payload }) => { s.adminLoading = false; s.adminError = payload; })

      .addCase(fetchBatches.pending,   (s)       => { s.adminLoading = true; })
      .addCase(fetchBatches.fulfilled, (s, { payload }) => { s.adminLoading = false; s.batchMap[payload.medicineId] = payload.batches; })
      .addCase(fetchBatches.rejected,  (s, { payload }) => { s.adminLoading = false; s.adminError = payload; })

      .addCase(createBatch.pending,   (s)       => { s.adminLoading = true;  s.adminError = null; })
      .addCase(createBatch.fulfilled, (s, { payload }) => {
        s.adminLoading = false;
        const { medicineId, batch } = payload;
        if (!s.batchMap[medicineId]) s.batchMap[medicineId] = [];
        s.batchMap[medicineId].push(batch);
      })
      .addCase(createBatch.rejected,  (s, { payload }) => { s.adminLoading = false; s.adminError = payload; })

      .addCase(editBatch.pending,   (s)       => { s.adminLoading = true;  s.adminError = null; })
      .addCase(editBatch.fulfilled, (s, { payload }) => {
        s.adminLoading = false;
        const { medicineId, batch } = payload;
        const arr = s.batchMap[medicineId] || [];
        const i = arr.findIndex((b) => b.batchId === batch.batchId);
        if (i !== -1) arr[i] = batch;
      })
      .addCase(editBatch.rejected,  (s, { payload }) => { s.adminLoading = false; s.adminError = payload; })

      .addCase(removeBatch.pending,   (s)       => { s.adminLoading = true;  s.adminError = null; })
      .addCase(removeBatch.fulfilled, (s, { payload }) => {
        s.adminLoading = false;
        const { medicineId, batchId } = payload;
        if (s.batchMap[medicineId]) {
          s.batchMap[medicineId] = s.batchMap[medicineId].filter((b) => b.batchId !== batchId);
        }
      })
      .addCase(removeBatch.rejected,  (s, { payload }) => { s.adminLoading = false; s.adminError = payload; });
  },
});

export default medicineSlice.reducer;