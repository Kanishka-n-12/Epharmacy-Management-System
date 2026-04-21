import {
  getAllDeliveries,
  getDeliveryStats,
  patchDeliveryStatus,
} from "../services/deliveryService";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


export const fetchDeliveries = createAsyncThunk(
  "deliveries/fetchDeliveries",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllDeliveries();
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
 
/* ─────────────────────────────────────────────
   SLICE
───────────────────────────────────────────── */
const deliverySlice = createSlice({
  name: "deliveries",
  initialState: {
    deliveries: [],
    stats: null,
    loading: false,
    adminLoading: false,
    error: null,
    adminError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    /* ── fetchDeliveries ── */
    builder
      .addCase(fetchDeliveries.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchDeliveries.fulfilled, (s, a) => { s.loading = false; s.deliveries = a.payload; })
      .addCase(fetchDeliveries.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
 
    /* ── fetchDeliveryStats ── */
    builder
      .addCase(fetchDeliveryStats.pending, (s) => { s.adminLoading = true; s.adminError = null; })
      .addCase(fetchDeliveryStats.fulfilled, (s, a) => { s.adminLoading = false; s.stats = a.payload; })
      .addCase(fetchDeliveryStats.rejected, (s, a) => { s.adminLoading = false; s.adminError = a.payload; });
 
    /* ── updateDeliveryStatus ── */
    builder
      .addCase(updateDeliveryStatus.pending, (s) => { s.adminLoading = true; s.adminError = null; })
      .addCase(updateDeliveryStatus.fulfilled, (s, a) => {
        s.adminLoading = false;
        // Optimistically update the delivery's order status in the list
        const updated = a.payload;
        if (updated?.deliveryId) {
          const i = s.deliveries.findIndex((d) => d.deliveryId === updated.deliveryId);
          if (i !== -1) s.deliveries[i] = updated;
        }
      })
      .addCase(updateDeliveryStatus.rejected, (s, a) => { s.adminLoading = false; s.adminError = a.payload; });
  },
});
 
export default deliverySlice.reducer;