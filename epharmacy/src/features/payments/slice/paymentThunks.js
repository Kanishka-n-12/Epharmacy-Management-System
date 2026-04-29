import { createAsyncThunk } from "@reduxjs/toolkit";
import { paymentService, recordFailedPayment } from "../service/paymentService";

export const fetchBillSummary = createAsyncThunk(
  "payment/fetchBillSummary",
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await paymentService.getBillSummary(orderId);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load bill");
    }
  }
);

export const makeCodOrUpiPayment = createAsyncThunk(
  "payment/makeCodOrUpiPayment",
  async (dto, { rejectWithValue }) => {
    try {
      return await paymentService.makePayment(dto);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Payment failed");
    }
  }
);

export const createRazorpayOrder = createAsyncThunk(
  "payment/createRazorpayOrder",
  async (dto, { rejectWithValue }) => {
    try {
      return await paymentService.createRazorpayOrder(dto);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to initiate Razorpay");
    }
  }



  
);

export const verifyRazorpayPayment = createAsyncThunk(
  "payment/verifyRazorpayPayment",
  async (dto, { rejectWithValue }) => {
    try {
      return await paymentService.verifyRazorpayPayment(dto);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Verification failed");
    }
  }
);

export const recordRazorpayFailure = createAsyncThunk(
  "payment/recordRazorpayFailure",
  async (dto, { rejectWithValue }) => {
    try {
      return await recordFailedPayment(dto);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to record payment failure");
    }
  }
);