import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllOrders,
  fetchOrderStats,
  updateOrderStatus,
  fetchAllPayments,
  fetchPaymentStats,
  updatePaymentStatus,
} from "./ordersPaymentsThunks";

const statusLower = (s) => (s || "").toLowerCase();

const ordersPaymentsSlice = createSlice({
  name: "ordersPayments",
  initialState: {
    orders: { content: [], totalPages: 0, totalElements: 0, number: 0 },
  payments: { content: [], totalPages: 0, totalElements: 0, number: 0 },
    
    orderStats:      { total: 0, placed: 0, shipped: 0, delivered: 0, cancelled: 0 },
    ordersLoading:   false,
    ordersError:     null,
    
    paymentStats:    { total: 0, success: 0, pending: 0, failed: 0 },
    paymentsLoading: false,
    paymentsError:   null,
    actionLoading:   false,
    actionError:     null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending,   (state) => { state.ordersLoading = true;  state.ordersError = null; })
      .addCase(fetchAllOrders.fulfilled, (state, { payload }) => {
  state.ordersLoading = false;
  state.orders = payload;
})
      .addCase(fetchAllOrders.rejected,  (state, { payload, error }) => { state.ordersLoading = false; state.ordersError = payload ?? error.message; })

      .addCase(fetchOrderStats.pending,   (state) => { state.ordersLoading = true; })
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
      .addCase(fetchOrderStats.rejected,  (state) => { state.ordersLoading = false; })

      .addCase(updateOrderStatus.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        const { id, status } = payload;
        const order = state.orders.find((o) => o.orderId === id);
        if (order) order.orderStatus = status;
        state.orderStats.placed    = state.orders.filter((o) => statusLower(o.orderStatus) === "placed").length;
        state.orderStats.shipped   = state.orders.filter((o) => statusLower(o.orderStatus) === "shipped").length;
        state.orderStats.delivered = state.orders.filter((o) => statusLower(o.orderStatus) === "delivered").length;
        state.orderStats.cancelled = state.orders.filter((o) => statusLower(o.orderStatus) === "cancelled").length;
        state.orderStats.total     = state.orders.length;
      })
      .addCase(updateOrderStatus.rejected,  (state, { payload, error }) => { state.actionLoading = false; state.actionError = payload ?? error.message; })

      .addCase(fetchAllPayments.pending,   (state) => { state.paymentsLoading = true;  state.paymentsError = null; })
      .addCase(fetchAllPayments.fulfilled, (state, { payload }) => {
  state.paymentsLoading = false;
  state.payments = payload;
})
      .addCase(fetchAllPayments.rejected,  (state, { payload, error }) => { state.paymentsLoading = false; state.paymentsError = payload ?? error.message; })

      .addCase(fetchPaymentStats.pending,   (state) => { state.paymentsLoading = true; })
      .addCase(fetchPaymentStats.fulfilled, (state, { payload }) => {
        state.paymentsLoading = false;
        state.paymentStats = {
          total:   payload.total   ?? 0,
          success: payload.success ?? 0,
          pending: payload.pending ?? 0,
          failed:  payload.failed  ?? 0,
        };
      })
      .addCase(fetchPaymentStats.rejected,  (state) => { state.paymentsLoading = false; })

      .addCase(updatePaymentStatus.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(updatePaymentStatus.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        const { id, status } = payload;
        const payment = state.payments.find((p) => p.paymentId === id);
        if (payment) payment.paymentStatus = status;
        state.paymentStats.success = state.payments.filter((p) => statusLower(p.paymentStatus) === "success").length;
        state.paymentStats.pending = state.payments.filter((p) => statusLower(p.paymentStatus) === "pending").length;
        state.paymentStats.failed  = state.payments.filter((p) => statusLower(p.paymentStatus) === "failed").length;
        state.paymentStats.total   = state.payments.length;
      })
      .addCase(updatePaymentStatus.rejected,  (state, { payload, error }) => { state.actionLoading = false; state.actionError = payload ?? error.message; });
  },
});

export default ordersPaymentsSlice.reducer;