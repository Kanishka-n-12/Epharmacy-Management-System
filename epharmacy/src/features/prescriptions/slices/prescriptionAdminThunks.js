import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllPrescriptionsAdmin,
  getPrescriptionStatsAdmin,
  updatePrescriptionStatusAdmin,
} from "../services/prescriptionAdminService";

export const fetchPrescriptions = createAsyncThunk(
  "prescriptions/fetchPrescriptions",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllPrescriptionsAdmin();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchPrescriptionStats = createAsyncThunk(
  "prescriptions/fetchPrescriptionStats",
  async (_, { rejectWithValue }) => {
    try {
      return await getPrescriptionStatsAdmin();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const updatePrescriptionStatus = createAsyncThunk(
  "prescriptions/updatePrescriptionStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await updatePrescriptionStatusAdmin(id, status);
      return { id, status };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);