import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentService } from "../service/paymentService";

export const fetchBillSummary = createAsyncThunk(
  "payment/fetchBillSummary",
  async (orderId, { rejectWithValue }) => {
    try {
      console.log("=== Fetching bill for orderId:", orderId); 
      const data = await paymentService.getBillSummary(orderId);
      console.log("=== Bill response:", data); 
      return data;
    } catch (err) {
      console.error("=== Bill fetch FAILED ===");
      console.error("Status:", err.response?.status);       
      console.error("Response data:", err.response?.data);  
      console.error("URL hit:", err.config?.url);           
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

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    billSummary: null,
    paymentResult: null,
    razorpayOrder: null,
    selectedMethod: null,
    loading: false,
    processing: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setSelectedMethod: (state, action) => { state.selectedMethod = action.payload; },
    clearPaymentMessages: (state) => { state.error = null; state.successMessage = null; },
    resetPayment: (state) => {
      state.paymentResult = null;
      state.razorpayOrder = null;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillSummary.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBillSummary.fulfilled, (s, a) => { s.loading = false; s.billSummary = a.payload; })
      .addCase(fetchBillSummary.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(makeCodOrUpiPayment.pending, (s) => { s.processing = true; s.error = null; })
      .addCase(makeCodOrUpiPayment.fulfilled, (s, a) => {
        s.processing = false; s.paymentResult = a.payload; s.successMessage = "Payment successful!";
      })
      .addCase(makeCodOrUpiPayment.rejected, (s, a) => { s.processing = false; s.error = a.payload; })

      .addCase(createRazorpayOrder.pending, (s) => { s.processing = true; s.error = null; })
      .addCase(createRazorpayOrder.fulfilled, (s, a) => { s.processing = false; s.razorpayOrder = a.payload; })
      .addCase(createRazorpayOrder.rejected, (s, a) => { s.processing = false; s.error = a.payload; })

      .addCase(verifyRazorpayPayment.pending, (s) => { s.processing = true; })
      .addCase(verifyRazorpayPayment.fulfilled, (s, a) => {
        s.processing = false; s.paymentResult = a.payload; s.successMessage = "Payment successful!";
      })
      .addCase(verifyRazorpayPayment.rejected, (s, a) => { s.processing = false; s.error = a.payload; });
  },
});

export const { setSelectedMethod, clearPaymentMessages, resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;