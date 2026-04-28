import { createAsyncThunk } from "@reduxjs/toolkit";
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
  getMedicineForAdmin,
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
  async ({ page = 0, size = 10, search = "", status = "" } = {}, { rejectWithValue }) => {
    try {
      const data = await getMedicineForAdmin(page, size, search, status);
      return {
        content:       data.content       ?? [],
        totalPages:    data.totalPages    ?? 1,
        totalElements: data.totalElements ?? 0,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAllMedicines = createAsyncThunk(
  "medicines/fetchAllMedicines",
  async (search, { rejectWithValue }) => {
    try { return await getAllMedicines(search); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

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