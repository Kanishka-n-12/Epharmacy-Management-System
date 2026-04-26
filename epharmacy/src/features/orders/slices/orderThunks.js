import { createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "../services/orderService";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, thunkAPI) => {
    try {
      return await orderService.getOrders();
    } catch (err) {
      if (err.response?.status === 404) return [];
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
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);