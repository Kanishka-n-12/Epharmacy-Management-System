import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCartApi,
  getCartSummaryApi,
  getCartCountApi,
  addToCartApi,
  updateQtyApi,
  removeItemApi,
  saveForLaterApi,
  moveToCartApi,
  deleteSavedApi,
  placeOrderApi,
  clearCartApi,
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

export const placeOrder = createAsyncThunk(
  "cart/placeOrder",
  async ({ addressId }, { rejectWithValue }) => {
    try {
      return await placeOrderApi(addressId);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const clearCartOnServer = createAsyncThunk(
  "cart/clearCartOnServer",
  async (_, { rejectWithValue }) => {
    try {
      return await clearCartApi();
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);