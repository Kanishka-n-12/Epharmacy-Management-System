import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCart,
  fetchCartSummary,
  fetchCartCount,
  addToCart,
  updateQty,
  removeItem,
  saveForLater,
  moveToCart,
  deleteSaved,
  placeOrder,
  clearCartOnServer,
} from "./cartThunks";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items:          [],
    summary:        null,
    count:          0,
    loading:        false,
    error:          null,
    pendingOrderId: null,
  },
  reducers: {
    clearCart(state) {
      state.items   = [];
      state.summary = null;
      state.count   = 0;
    },
    setPendingOrderId(state, { payload }) {
      state.pendingOrderId = payload;
    },
    clearSummary(state) {
      state.summary = { numberOfItems: 0, mrpTotal: 0, cartTotal: 0 };
      state.count   = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items   = payload;
        state.count   = payload.length;
        if (payload.length === 0) {
          state.summary = { numberOfItems: 0, mrpTotal: 0, cartTotal: 0 };
        }
      })
      .addCase(fetchCart.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      .addCase(fetchCartSummary.fulfilled, (state, { payload }) => {
        if (payload) state.summary = payload;
      })

      .addCase(fetchCartCount.fulfilled, (state, { payload }) => {
        state.count = payload;
      })

      .addCase(addToCart.rejected,    (state, { payload }) => { state.error = payload; })
      .addCase(updateQty.rejected,    (state, { payload }) => { state.error = payload; })
      .addCase(removeItem.rejected,   (state, { payload }) => { state.error = payload; })
      .addCase(saveForLater.rejected, (state, { payload }) => { state.error = payload; })
      .addCase(moveToCart.rejected,   (state, { payload }) => { state.error = payload; })
      .addCase(deleteSaved.rejected,  (state, { payload }) => { state.error = payload; })

      .addCase(placeOrder.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(placeOrder.fulfilled, (state, { payload }) => {
        state.loading        = false;
        state.pendingOrderId = payload?.orderId ?? payload?.id ?? null;
      })
      .addCase(clearCartOnServer.fulfilled, (state) => {
  state.items   = [];
  state.summary = { numberOfItems: 0, mrpTotal: 0, cartTotal: 0 };
  state.count   = 0;
})
.addCase(clearCartOnServer.rejected, (state, { payload }) => {
  state.error = payload;
})
      .addCase(placeOrder.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; });
  },
});

export const { clearCart, setPendingOrderId, clearSummary } = cartSlice.actions;
export default cartSlice.reducer;