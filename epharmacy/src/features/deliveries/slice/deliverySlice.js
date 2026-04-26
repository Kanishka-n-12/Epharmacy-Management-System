import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDeliveries,
  fetchDeliveryStats,
  updateDeliveryStatus,
} from "./deliveryThunks";

const deliverySlice = createSlice({
  name: "deliveries",
  initialState: {
    deliveries:   [],
    totalPages:   0,
    totalElements: 0,
    currentPage:  0,
    stats:        null,
    loading:      false,
    adminLoading: false,
    error:        null,
    adminError:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveries.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchDeliveries.fulfilled, (s, { payload }) => {
        s.loading       = false;
        // Spring Page response has content, totalPages, totalElements, number
        s.deliveries    = payload.content;
        s.totalPages    = payload.totalPages;
        s.totalElements = payload.totalElements;
        s.currentPage   = payload.number;
      })
      .addCase(fetchDeliveries.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

      .addCase(fetchDeliveryStats.pending,   (s) => { s.adminLoading = true;  s.adminError = null; })
      .addCase(fetchDeliveryStats.fulfilled, (s, { payload }) => { s.adminLoading = false; s.stats = payload; })
      .addCase(fetchDeliveryStats.rejected,  (s, { payload }) => { s.adminLoading = false; s.adminError = payload; })

      .addCase(updateDeliveryStatus.pending,   (s) => { s.adminLoading = true;  s.adminError = null; })
      .addCase(updateDeliveryStatus.fulfilled, (s, { payload }) => {
        s.adminLoading = false;
        if (payload?.deliveryId) {
          const i = s.deliveries.findIndex((d) => d.deliveryId === payload.deliveryId);
          if (i !== -1) s.deliveries[i] = payload;
        }
      })
      .addCase(updateDeliveryStatus.rejected,  (s, { payload }) => { s.adminLoading = false; s.adminError = payload; });
  },
});

export default deliverySlice.reducer;