import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchStats,
  fetchMonthlyRevenue,
  fetchCategorySales,
  fetchWeeklyOrders,
  fetchUserStats,
} from "../services/dashboardService";

export const loadDashboard = createAsyncThunk(
  "dashboard/loadAll",
  async (_, { rejectWithValue }) => {
    try {
      const [stats, revenue, categories, orders, users] = await Promise.all([
        fetchStats(),
        fetchMonthlyRevenue(),
        fetchCategorySales(),
        fetchWeeklyOrders(),
        fetchUserStats(),
      ]);
      return { stats, revenue, categories, orders, users };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load dashboard");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats:      null,
    revenue:    [],
    categories: [],
    orders:     [],
    users:      [],
    loading:    false,
    error:      null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending,  (state)           => { state.loading = true;  state.error = null; })
      .addCase(loadDashboard.fulfilled,(state, { payload }) => {
        state.loading    = false;
        state.stats      = payload.stats;
        state.revenue    = payload.revenue;
        state.categories = payload.categories;
        state.orders     = payload.orders;
        state.users      = payload.users;
      })
      .addCase(loadDashboard.rejected, (state, { payload }) => { state.loading = false; state.error = payload; });
  },
});

export default dashboardSlice.reducer;