import { createSlice } from "@reduxjs/toolkit";
import {
  fetchOrders,
  fetchOrder,
  placeOrder,
  cancelOrder,
} from "./orderThunks";

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders:        [],
    selectedOrder: null,
    loading:       false,
    detailLoading: false,
    cancelling:    false,
    error:         null,
    cancelError:   null,
    cancelSuccess: null,
  },
  reducers: {
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
    clearCancelMessages(state) {
      state.cancelError   = null;
      state.cancelSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => { state.loading = false; state.orders = payload; })
      .addCase(fetchOrders.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      .addCase(fetchOrder.pending,   (state) => { state.detailLoading = true; })
      .addCase(fetchOrder.fulfilled, (state, { payload }) => { state.detailLoading = false; state.selectedOrder = payload; })
      .addCase(fetchOrder.rejected,  (state) => { state.detailLoading = false; })

      .addCase(placeOrder.fulfilled, (state, { payload }) => { state.orders.unshift(payload); })

      .addCase(cancelOrder.pending,   (state) => { state.cancelling = true;  state.cancelError = null; state.cancelSuccess = null; })
      .addCase(cancelOrder.fulfilled, (state, { payload }) => {
        state.cancelling = false;
        const order = state.orders.find((o) => o.orderId === payload);
        if (order) order.orderStatus = "cancelled";
        if (state.selectedOrder?.orderId === payload) state.selectedOrder.orderStatus = "cancelled";
        state.cancelSuccess = `Order #${payload} has been cancelled.`;
      })
      .addCase(cancelOrder.rejected,  (state, { payload }) => { state.cancelling = false; state.cancelError = payload; });
  },
});

export const { clearSelectedOrder, clearCancelMessages } = orderSlice.actions;
export default orderSlice.reducer;