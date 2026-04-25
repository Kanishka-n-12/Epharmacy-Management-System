import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../api";

export const loadDashboard = createAsyncThunk(
  "dashboard/loadAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/dashboard/full");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load dashboard");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    data:    null,
    loading: false,
    error:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending,   (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loadDashboard.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data    = payload;
      })
      .addCase(loadDashboard.rejected,  (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      });
  },
});

export default dashboardSlice.reducer;