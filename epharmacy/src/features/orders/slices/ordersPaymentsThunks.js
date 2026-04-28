import { createAsyncThunk } from "@reduxjs/toolkit";
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

export const fetchAllOrders = createAsyncThunk(
  "ordersPayments/fetchAllOrders",
  async ({ page = 0, size = 10, search = "", orderStatus = "", paymentStatus = "", date = "" } = {}, { rejectWithValue }) => {
    try { return await getAllOrdersAdmin(page, size, search, orderStatus, paymentStatus, date); }
    catch (err) { return rejectWithValue(err.response?.data?.message ?? err.message); }
  }
);

export const fetchAllPayments = createAsyncThunk(
  "ordersPayments/fetchAllPayments",
  async ({ page = 0, size = 10, search = "", status = "", method = "", date = "" } = {}, { rejectWithValue }) => {
    try { return await getAllPaymentsAdmin(page, size, search, status, method, date); }
    catch (err) { return rejectWithValue(err.response?.data?.message ?? err.message); }
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