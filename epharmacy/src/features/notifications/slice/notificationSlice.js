
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotifications,
  getNotificationCount,
  markNotificationRead,
  getSentNotifications,
  sendNotification,
} from "../services/notificationService";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getNotifications();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchNotificationCount = createAsyncThunk(
  "notifications/fetchCount",
  async (_, { rejectWithValue }) => {
    try {
      return await getNotificationCount();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await markNotificationRead(id);
      dispatch(fetchNotificationCount());
      if (data && typeof data === "object") return data;
      return { id, status: "READ" };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchSentNotifications = createAsyncThunk(
  "notifications/fetchSent",
  async (_, { rejectWithValue }) => {
    try {
      return await getSentNotifications();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createNotification = createAsyncThunk(
  "notifications/create",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await sendNotification(data, id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list:     [],
    sentList: [],
    count:    0,
    loading:  false,
    error:    null,
  },
  reducers: {
    optimisticMarkRead: (state, action) => {
      const id  = action.payload;
      const idx = state.list.findIndex((n) => n.id === id);
      if (idx !== -1) {
        state.list[idx] = { ...state.list[idx], status: "READ" };
        if (state.count > 0) state.count -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchNotifications.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchNotifications.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    builder
      .addCase(fetchNotificationCount.fulfilled, (s, a) => { s.count = a.payload; });

    builder
      .addCase(markAsRead.pending, (s, a) => {
        const id  = a.meta.arg;
        const idx = s.list.findIndex((n) => n.id === id);
        if (idx !== -1) {
          s.list[idx] = { ...s.list[idx], status: "READ" };
          if (s.count > 0) s.count -= 1;
        }
      })
      .addCase(markAsRead.fulfilled, (s, a) => {
        const updated = a.payload;
        if (updated?.id) {
          const idx = s.list.findIndex((n) => n.id === updated.id);
          if (idx !== -1) s.list[idx] = { ...s.list[idx], ...updated };
        }
      })
      .addCase(markAsRead.rejected, (s, a) => { s.error = a.payload; });

    builder
      .addCase(fetchSentNotifications.pending,   (s) => { s.loading = true; })
      .addCase(fetchSentNotifications.fulfilled,  (s, a) => { s.loading = false; s.sentList = a.payload; })
      .addCase(fetchSentNotifications.rejected,   (s, a) => { s.loading = false; s.error = a.payload; });

    builder
      .addCase(createNotification.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(createNotification.fulfilled, (s) => { s.loading = false; })
      .addCase(createNotification.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { optimisticMarkRead } = notificationSlice.actions;
export default notificationSlice.reducer;