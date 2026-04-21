import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllOrdersAdmin,
  getOrderStatsAdmin,
  updateOrderStatusAdmin,
} from "../services/ordersAdminService";
import {
  getAllPaymentsAdmin,
  getPaymentStatsAdmin,
  updatePaymentStatusAdmin,
} from "../../payments/service/paymentAdminService";

/* ─────────────────────────────────────────────
   ORDER THUNKS
───────────────────────────────────────────── */

export const fetchAllOrders = createAsyncThunk(
  "ordersPayments/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllOrdersAdmin();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchOrderStats = createAsyncThunk(
  "ordersPayments/fetchOrderStats",
  async (_, { rejectWithValue }) => {
    try {
      return await getOrderStatsAdmin();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// status must be uppercase enum: PLACED | SHIPPED | DELIVERED | CANCELLED
export const updateOrderStatus = createAsyncThunk(
  "ordersPayments/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await updateOrderStatusAdmin(id, status);
      return { id, status };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

/* ─────────────────────────────────────────────
   PAYMENT THUNKS
───────────────────────────────────────────── */

export const fetchAllPayments = createAsyncThunk(
  "ordersPayments/fetchAllPayments",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllPaymentsAdmin();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchPaymentStats = createAsyncThunk(
  "ordersPayments/fetchPaymentStats",
  async (_, { rejectWithValue }) => {
    try {
      return await getPaymentStatsAdmin();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// status must be uppercase enum: SUCCESS | PENDING | FAILED
export const updatePaymentStatus = createAsyncThunk(
  "ordersPayments/updatePaymentStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await updatePaymentStatusAdmin(id, status);
      return { id, status };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

/* ─────────────────────────────────────────────
   SLICE
───────────────────────────────────────────── */
const ordersPaymentsSlice = createSlice({
  name: "ordersPayments",
  initialState: {
    // Orders
    orders: [],
    orderStats: {
      total: 0,
      placed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    ordersLoading: false,
    ordersError: null,

    // Payments
    payments: [],
    paymentStats: {
      total: 0,
      success: 0,
      pending: 0,
      failed: 0,
    },
    paymentsLoading: false,
    paymentsError: null,

    // Shared action loading (status updates)
    actionLoading: false,
    actionError: null,
  },

  extraReducers: (builder) => {
    /* ── fetchAllOrders ── */
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, { payload }) => {
        state.ordersLoading = false;
        state.orders = payload || [];
      })
      .addCase(fetchAllOrders.rejected, (state, { payload, error }) => {
        state.ordersLoading = false;
        state.ordersError = payload ?? error.message;
      });

    /* ── fetchOrderStats ── */
    builder
      .addCase(fetchOrderStats.pending, (state) => {
        state.ordersLoading = true;
      })
      .addCase(fetchOrderStats.fulfilled, (state, { payload }) => {
        state.ordersLoading = false;
        state.orderStats = {
          total:     payload.total     ?? 0,
          placed:    payload.placed    ?? 0,
          shipped:   payload.shipped   ?? 0,
          delivered: payload.delivered ?? 0,
          cancelled: payload.cancelled ?? 0,
        };
      })
      .addCase(fetchOrderStats.rejected, (state) => {
        state.ordersLoading = false;
      });

    /* ── updateOrderStatus ── */
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        const { id, status } = payload;

        // Update order in list — orderStatus comes back as uppercase from enum
        const order = state.orders.find((o) => o.orderId === id);
        if (order) order.orderStatus = status;

        // Recalculate order stats locally
        const statusLower = (s) => (s || "").toLowerCase();
        state.orderStats.placed    = state.orders.filter((o) => statusLower(o.orderStatus) === "placed").length;
        state.orderStats.shipped   = state.orders.filter((o) => statusLower(o.orderStatus) === "shipped").length;
        state.orderStats.delivered = state.orders.filter((o) => statusLower(o.orderStatus) === "delivered").length;
        state.orderStats.cancelled = state.orders.filter((o) => statusLower(o.orderStatus) === "cancelled").length;
        state.orderStats.total     = state.orders.length;
      })
      .addCase(updateOrderStatus.rejected, (state, { payload, error }) => {
        state.actionLoading = false;
        state.actionError = payload ?? error.message;
      });

    /* ── fetchAllPayments ── */
    builder
      .addCase(fetchAllPayments.pending, (state) => {
        state.paymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, { payload }) => {
        state.paymentsLoading = false;
        state.payments = payload || [];
      })
      .addCase(fetchAllPayments.rejected, (state, { payload, error }) => {
        state.paymentsLoading = false;
        state.paymentsError = payload ?? error.message;
      });

    /* ── fetchPaymentStats ── */
    builder
      .addCase(fetchPaymentStats.pending, (state) => {
        state.paymentsLoading = true;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, { payload }) => {
        state.paymentsLoading = false;
        state.paymentStats = {
          total:   payload.total   ?? 0,
          success: payload.success ?? 0,
          pending: payload.pending ?? 0,
          failed:  payload.failed  ?? 0,
        };
      })
      .addCase(fetchPaymentStats.rejected, (state) => {
        state.paymentsLoading = false;
      });

    /* ── updatePaymentStatus ── */
    builder
      .addCase(updatePaymentStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        const { id, status } = payload;

        // Update payment in list
        // Payment entity field is paymentId — adjust if your API returns different field name
        const payment = state.payments.find((p) => p.paymentId === id);
        if (payment) payment.paymentStatus = status;

        // Recalculate payment stats locally
        const statusLower = (s) => (s || "").toLowerCase();
        state.paymentStats.success = state.payments.filter((p) => statusLower(p.paymentStatus) === "success").length;
        state.paymentStats.pending = state.payments.filter((p) => statusLower(p.paymentStatus) === "pending").length;
        state.paymentStats.failed  = state.payments.filter((p) => statusLower(p.paymentStatus) === "failed").length;
        state.paymentStats.total   = state.payments.length;
      })
      .addCase(updatePaymentStatus.rejected, (state, { payload, error }) => {
        state.actionLoading = false;
        state.actionError = payload ?? error.message;
      });
  },
});

export default ordersPaymentsSlice.reducer;