import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllMedicines,
  getMedicineById,
  getNewLaunches,
  addMedicine,
  updateMedicine,
  updateMedicineAvailability,
  getMedicineStats,
  getBatchesByMedicine,
  addBatch,
  updateBatch,
  deleteBatch,
  getMedicineForAdmin
} from "../services/medicineService";
import { getAllCategories } from "../../categories/services/categoryService";
 
export const fetchNewLaunches = createAsyncThunk(
  "medicines/fetchNewLaunches",
  async (_, { rejectWithValue }) => {
    try { return await getNewLaunches(); }
    catch (err) { return rejectWithValue(err.message); }
  }
);
 
export const fetchAllMedicinesForAdmin = createAsyncThunk(
  "medicines/fetchAllMedicinesAdmin",
  async (search, { rejectWithValue }) => {
    try { return await getMedicineForAdmin(); }
    catch (err) { return rejectWithValue(err.message); }
  }
);
 
export const fetchAllMedicines = createAsyncThunk(
  "medicines/fetchAllMedicines",
  async (search, { rejectWithValue }) => {
    try { return await getAllMedicines(search); }
    catch (err) { return rejectWithValue(err.message); }
  }
);
 
// ── NEW ──
export const fetchMedicineById = createAsyncThunk(
  "medicines/fetchMedicineById",
  async (id, { rejectWithValue }) => {
    try { return await getMedicineById(id); }
    catch (err) { return rejectWithValue(err.message); }
  }
);
 
export const fetchCategories = createAsyncThunk(
  "medicines/fetchCategories",
  async (_, { rejectWithValue }) => {
    try { return await getAllCategories(); }
    catch (err) { return rejectWithValue(err.message); }
  }
);
 
export const fetchMedicineStats = createAsyncThunk(
  "medicines/fetchMedicineStats",
  async (_, { rejectWithValue }) => {
    try { return await getMedicineStats(); }
    catch (err) { return rejectWithValue(err.message); }
  }
);
 
export const createMedicine = createAsyncThunk(
  "medicines/createMedicine",
  async (dto, { rejectWithValue }) => {
    try { return await addMedicine(dto); }
    catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
 
export const editMedicine = createAsyncThunk(
  "medicines/editMedicine",
  async ({ id, dto }, { rejectWithValue }) => {
    try { return await updateMedicine(id, dto); }
    catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
 
export const changeMedicineAvailability = createAsyncThunk(
  "medicines/changeMedicineAvailability",
  async ({ id, status }, { rejectWithValue }) => {
    try { return await updateMedicineAvailability(id, status); }
    catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
 
export const fetchBatches = createAsyncThunk(
  "medicines/fetchBatches",
  async (medicineId, { rejectWithValue }) => {
    try {
      const data = await getBatchesByMedicine(medicineId);
      return { medicineId, batches: data };
    } catch (err) { return rejectWithValue(err.message); }
  }
);
 
export const createBatch = createAsyncThunk(
  "medicines/createBatch",
  async ({ medicineId, dto }, { rejectWithValue }) => {
    try {
      const data = await addBatch(medicineId, dto);
      return { medicineId, batch: data };
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
 
export const editBatch = createAsyncThunk(
  "medicines/editBatch",
  async ({ medicineId, batchId, dto }, { rejectWithValue }) => {
    try {
      const data = await updateBatch(medicineId, batchId, dto);
      return { medicineId, batch: data };
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
 
export const removeBatch = createAsyncThunk(
  "medicines/removeBatch",
  async ({ medicineId, batchId }, { rejectWithValue }) => {
    try {
      await deleteBatch(medicineId, batchId);
      return { medicineId, batchId };
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
 
const medicineSlice = createSlice({
  name: "medicines",
  initialState: {
    newLaunches:      [],
    allMedicines:     [],
    adminMedicines:   [],
    stats:            null,
    batchMap:         {},
    categories:       [],
    selectedMedicine: null,   // ← NEW
    loading:          false,
    adminLoading:     false,
    detailLoading:    false,  // ← NEW
    error:            null,
    adminError:       null,
    detailError:      null,   // ← NEW
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewLaunches.pending,   (s)    => { s.loading = true;  s.error = null; })
      .addCase(fetchNewLaunches.fulfilled, (s, a) => { s.loading = false; s.newLaunches = a.payload; })
      .addCase(fetchNewLaunches.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
 
    builder
      .addCase(fetchAllMedicines.pending,   (s)    => { s.loading = true;  s.error = null; })
      .addCase(fetchAllMedicines.fulfilled, (s, a) => { s.loading = false; s.allMedicines = a.payload; s.adminMedicines = a.payload; })
      .addCase(fetchAllMedicines.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
 
    builder
      .addCase(fetchAllMedicinesForAdmin.pending,   (s)    => { s.loading = true;  s.error = null; })
      .addCase(fetchAllMedicinesForAdmin.fulfilled, (s, a) => { s.loading = false; s.allMedicines = a.payload; s.adminMedicines = a.payload; })
      .addCase(fetchAllMedicinesForAdmin.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
 
    // ── NEW: fetch single medicine ──
    builder
      .addCase(fetchMedicineById.pending,   (s)    => { s.detailLoading = true;  s.detailError = null; s.selectedMedicine = null; })
      .addCase(fetchMedicineById.fulfilled, (s, a) => { s.detailLoading = false; s.selectedMedicine = a.payload; })
      .addCase(fetchMedicineById.rejected,  (s, a) => { s.detailLoading = false; s.detailError = a.payload; });
 
    builder
      .addCase(fetchCategories.pending,   (s)    => { s.adminLoading = true; })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.adminLoading = false; s.categories = a.payload; })
      .addCase(fetchCategories.rejected,  (s, a) => { s.adminLoading = false; s.adminError = a.payload; });
 
    builder
      .addCase(fetchMedicineStats.pending,   (s)    => { s.adminLoading = true; })
      .addCase(fetchMedicineStats.fulfilled, (s, a) => { s.adminLoading = false; s.stats = a.payload; })
      .addCase(fetchMedicineStats.rejected,  (s, a) => { s.adminLoading = false; s.adminError = a.payload; });
 
    builder
      .addCase(createMedicine.pending,   (s)    => { s.adminLoading = true;  s.adminError = null; })
      .addCase(createMedicine.fulfilled, (s, a) => {
        s.adminLoading = false;
        s.adminMedicines.push(a.payload);
        s.allMedicines.push(a.payload);
      })
      .addCase(createMedicine.rejected,  (s, a) => { s.adminLoading = false; s.adminError = a.payload; });
 
    builder
      .addCase(editMedicine.pending,   (s)    => { s.adminLoading = true;  s.adminError = null; })
      .addCase(editMedicine.fulfilled, (s, a) => {
        s.adminLoading = false;
        const update = (arr) => {
          const i = arr.findIndex((m) => m.id === a.payload.id);
          if (i !== -1) arr[i] = a.payload;
        };
        update(s.adminMedicines);
        update(s.allMedicines);
      })
      .addCase(editMedicine.rejected,  (s, a) => { s.adminLoading = false; s.adminError = a.payload; });
 
    builder
      .addCase(changeMedicineAvailability.pending,   (s)    => { s.adminLoading = true;  s.adminError = null; })
      .addCase(changeMedicineAvailability.fulfilled, (s, a) => {
        s.adminLoading = false;
        const update = (arr) => {
          const i = arr.findIndex((m) => m.id === a.payload.id);
          if (i !== -1) arr[i] = a.payload;
        };
        update(s.adminMedicines);
        update(s.allMedicines);
      })
      .addCase(changeMedicineAvailability.rejected,  (s, a) => { s.adminLoading = false; s.adminError = a.payload; });
 
    builder
      .addCase(fetchBatches.pending,   (s)    => { s.adminLoading = true; })
      .addCase(fetchBatches.fulfilled, (s, a) => {
        s.adminLoading = false;
        s.batchMap[a.payload.medicineId] = a.payload.batches;
      })
      .addCase(fetchBatches.rejected,  (s, a) => { s.adminLoading = false; s.adminError = a.payload; });
 
    builder
      .addCase(createBatch.pending,   (s)    => { s.adminLoading = true;  s.adminError = null; })
      .addCase(createBatch.fulfilled, (s, a) => {
        s.adminLoading = false;
        const { medicineId, batch } = a.payload;
        if (!s.batchMap[medicineId]) s.batchMap[medicineId] = [];
        s.batchMap[medicineId].push(batch);
      })
      .addCase(createBatch.rejected,  (s, a) => { s.adminLoading = false; s.adminError = a.payload; });
 
    builder
      .addCase(editBatch.pending,   (s)    => { s.adminLoading = true;  s.adminError = null; })
      .addCase(editBatch.fulfilled, (s, a) => {
        s.adminLoading = false;
        const { medicineId, batch } = a.payload;
        const arr = s.batchMap[medicineId] || [];
        const i = arr.findIndex((b) => b.batchId === batch.batchId);
        if (i !== -1) arr[i] = batch;
      })
      .addCase(editBatch.rejected,  (s, a) => { s.adminLoading = false; s.adminError = a.payload; });
 
    builder
      .addCase(removeBatch.pending,   (s)    => { s.adminLoading = true;  s.adminError = null; })
      .addCase(removeBatch.fulfilled, (s, a) => {
        s.adminLoading = false;
        const { medicineId, batchId } = a.payload;
        if (s.batchMap[medicineId]) {
          s.batchMap[medicineId] = s.batchMap[medicineId].filter(
            (b) => b.batchId !== batchId
          );
        }
      })
      .addCase(removeBatch.rejected,  (s, a) => { s.adminLoading = false; s.adminError = a.payload; });
  },
});
 
export default medicineSlice.reducer;