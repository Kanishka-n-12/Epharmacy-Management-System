import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllDeliveries,
  getDeliveryStats,
  patchDeliveryStatus,
} from "../services/deliveryService";

export const fetchDeliveries = createAsyncThunk(
  "deliveries/fetchDeliveries",
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      return await getAllDeliveries(page, size);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchDeliveryStats = createAsyncThunk(
  "deliveries/fetchDeliveryStats",
  async (_, { rejectWithValue }) => {
    try {
      return await getDeliveryStats();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateDeliveryStatus = createAsyncThunk(
  "deliveries/updateDeliveryStatus",
  async ({ deliveryId, status }, { rejectWithValue }) => {
    try {
      return await patchDeliveryStatus(deliveryId, status);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);