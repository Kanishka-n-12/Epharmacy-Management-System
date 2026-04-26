import { createSlice } from "@reduxjs/toolkit";
import {
  broadcastNotification,
  fetchNotifications,
  fetchNotificationCount,
  markAsRead,
  fetchSentNotifications,
  createNotification,
} from "./notificationThunks";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list:    [],
    sentList: [],
    count:   0,
    loading: false,
    error:   null,
  },
  reducers: {
    optimisticMarkRead: (state, { payload }) => {
      const idx = state.list.findIndex((n) => n.id === payload);
      if (idx !== -1) {
        state.list[idx] = { ...state.list[idx], status: "READ" };
        if (state.count > 0) state.count -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending,   (s)       => { s.loading = true;  s.error = null; })
      .addCase(fetchNotifications.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload; })
      .addCase(fetchNotifications.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

      .addCase(fetchNotificationCount.fulfilled, (s, { payload }) => { s.count = payload; })

      .addCase(broadcastNotification.pending,   (s)       => { s.loading = true;  s.error = null; })
      .addCase(broadcastNotification.fulfilled, (s)       => { s.loading = false; })
      .addCase(broadcastNotification.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

      .addCase(markAsRead.pending, (s, { meta }) => {
        const idx = s.list.findIndex((n) => n.id === meta.arg);
        if (idx !== -1) {
          s.list[idx] = { ...s.list[idx], status: "READ" };
          if (s.count > 0) s.count -= 1;
        }
      })
      .addCase(markAsRead.fulfilled, (s, { payload }) => {
        if (payload?.id) {
          const idx = s.list.findIndex((n) => n.id === payload.id);
          if (idx !== -1) s.list[idx] = { ...s.list[idx], ...payload };
        }
      })
      .addCase(markAsRead.rejected, (s, { payload }) => { s.error = payload; })

      .addCase(fetchSentNotifications.pending,   (s)       => { s.loading = true; })
      .addCase(fetchSentNotifications.fulfilled, (s, { payload }) => { s.loading = false; s.sentList = payload; })
      .addCase(fetchSentNotifications.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

      .addCase(createNotification.pending,   (s)       => { s.loading = true;  s.error = null; })
      .addCase(createNotification.fulfilled, (s)       => { s.loading = false; })
      .addCase(createNotification.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; });
  },
});

export const { optimisticMarkRead } = notificationSlice.actions;
export default notificationSlice.reducer;