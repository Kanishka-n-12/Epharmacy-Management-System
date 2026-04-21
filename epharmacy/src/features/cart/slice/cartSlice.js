import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCartApi, getCartSummaryApi, getCartCountApi,
  addToCartApi, updateQtyApi, removeItemApi,
  saveForLaterApi, moveToCartApi, deleteSavedApi, placeOrderApi
} from "../services/cartService";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCartApi();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      if (e.response?.status === 404) return [];
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const placeOrder = createAsyncThunk(
  "cart/placeOrder",
  async ({ addressId }, { rejectWithValue }) => {
    try {
      const result = await placeOrderApi(addressId);
      console.log("Backend response from placeOrder:", result);
      return result;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const fetchCartSummary = createAsyncThunk(
  "cart/fetchCartSummary",
  async (_, { rejectWithValue }) => {
    try {
      return await getCartSummaryApi();
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const fetchCartCount = createAsyncThunk(
  "cart/fetchCartCount",
  async (_, { rejectWithValue }) => {
    try {
      return await getCartCountApi();
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ medicineId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await addToCartApi(medicineId, quantity);
      await dispatch(fetchCart()).unwrap();
      await dispatch(fetchCartSummary()).unwrap();
      await dispatch(fetchCartCount()).unwrap();
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({ medicineId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await updateQtyApi(medicineId, quantity);
      dispatch(fetchCart());
      dispatch(fetchCartSummary());
      dispatch(fetchCartCount());
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (medicineId, { dispatch, rejectWithValue }) => {
    try {
      await removeItemApi(medicineId);
      const items = await dispatch(fetchCart()).unwrap();
      if (items.length > 0) {
        await dispatch(fetchCartSummary()).unwrap();
      } else {
        dispatch({ type: "cart/clearSummary" });
      }
      await dispatch(fetchCartCount()).unwrap();
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const saveForLater = createAsyncThunk(
  "cart/saveForLater",
  async (medicineId, { dispatch, rejectWithValue }) => {
    try {
      await saveForLaterApi(medicineId);
      const items = await dispatch(fetchCart()).unwrap();
      if (items.length > 0) {
        await dispatch(fetchCartSummary()).unwrap();
      } else {
        dispatch({ type: "cart/clearSummary" });
      }
      await dispatch(fetchCartCount()).unwrap();
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const moveToCart = createAsyncThunk(
  "cart/moveToCart",
  async (medicineId, { dispatch, rejectWithValue }) => {
    try {
      await moveToCartApi(medicineId);
      dispatch(fetchCart());
      dispatch(fetchCartSummary());
      dispatch(fetchCartCount());
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const deleteSaved = createAsyncThunk(
  "cart/deleteSaved",
  async (medicineId, { dispatch, rejectWithValue }) => {
    try {
      await deleteSavedApi(medicineId);
      dispatch(fetchCart());
      dispatch(fetchCartCount());
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    summary: null,
    count: 0,
    loading: false,
    error: null,
    pendingOrderId: null,
  },
  reducers: {
    clearCart(state) {
      state.items   = [];
      state.summary = null;
      state.count   = 0;
    },
    setPendingOrderId(state, action) {
      state.pendingOrderId = action.payload;
    },
    clearSummary(state) {
      state.summary = { numberOfItems: 0, mrpTotal: 0, cartTotal: 0 };
      state.count   = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
        state.count = payload.length;
        if (payload.length === 0) {
          state.summary = { numberOfItems: 0, mrpTotal: 0, cartTotal: 0 };
        }
      })
      .addCase(fetchCart.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      })

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

      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(placeOrder.fulfilled, (state, { payload }) => {
        state.loading        = false;
        state.pendingOrderId = payload?.orderId ?? payload?.id ?? null;
      })
      .addCase(placeOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      });
  },
});

export const { clearCart, setPendingOrderId, clearSummary } = cartSlice.actions;
export default cartSlice.reducer;