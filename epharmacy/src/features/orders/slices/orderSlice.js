// features/orders/slice/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "../services/orderService";


export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, thunkAPI) => {
    try {
      return await orderService.getOrders();
    } catch (err) {
      if (err.response?.status === 404) {
      return []; 
    }
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const fetchOrder = createAsyncThunk(
  "orders/fetchOrder",
  async (id, thunkAPI) => {
    try {
      return await orderService.getOrder(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const placeOrder = createAsyncThunk(
  "orders/placeOrder",
  async (addressId, thunkAPI) => {
    try {
      return await orderService.placeOrder(addressId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (id, thunkAPI) => {
    try {
      await orderService.cancelOrder(id);
      return id; // return id so we can update the list locally
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

/* ─────────────────────────────────────────
   SLICE
───────────────────────────────────────── */
const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],           
    selectedOrder: null, 
    loading: false,
    detailLoading: false,
    cancelling: false,
    error: null,
    cancelError: null,
    cancelSuccess: null,
  },
  reducers: {
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
    clearCancelMessages(state) {
      state.cancelError = null;
      state.cancelSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ── fetchOrders ── */
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ── fetchOrder (single) ── */
      .addCase(fetchOrder.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrder.rejected, (state) => {
        state.detailLoading = false;
      })

      /* ── placeOrder ── */
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })

      /* ── cancelOrder ── */
      .addCase(cancelOrder.pending, (state) => {
        state.cancelling = true;
        state.cancelError = null;
        state.cancelSuccess = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelling = false;
        const id = action.payload;
        const order = state.orders.find((o) => o.orderId === id);
        if (order) order.orderStatus = "cancelled";
        if (state.selectedOrder?.orderId === id) {
          state.selectedOrder.orderStatus = "cancelled";
        }
        state.cancelSuccess = `Order #${id} has been cancelled.`;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelling = false;
        state.cancelError = action.payload;
      });
  },
});

export const { clearSelectedOrder, clearCancelMessages } = orderSlice.actions;
export default orderSlice.reducer;