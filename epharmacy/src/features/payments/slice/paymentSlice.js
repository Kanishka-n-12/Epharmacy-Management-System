import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBillSummary,
  makeCodOrUpiPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordRazorpayFailure,
} from "./paymentThunks";

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    billSummary:    null,
    paymentResult:  null,
    razorpayOrder:  null,
    selectedMethod: null,
    loading:        false,
    processing:     false,
    error:          null,
    successMessage: null,
  },
  reducers: {
    setSelectedMethod:    (state, { payload }) => { state.selectedMethod = payload; },
    clearPaymentMessages: (state) => { state.error = null; state.successMessage = null; },
    resetPayment:         (state) => {
      state.paymentResult  = null;
      state.razorpayOrder  = null;
      state.error          = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillSummary.pending,   (s)       => { s.loading = true;  s.error = null; })
      .addCase(fetchBillSummary.fulfilled, (s, { payload }) => { s.loading = false; s.billSummary = payload; })
      .addCase(fetchBillSummary.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

      .addCase(makeCodOrUpiPayment.pending,   (s)       => { s.processing = true;  s.error = null; })
      .addCase(makeCodOrUpiPayment.fulfilled, (s, { payload }) => {
        s.processing     = false;
        s.paymentResult  = payload;
        s.successMessage = "Payment successful!";
      })
      .addCase(makeCodOrUpiPayment.rejected,  (s, { payload }) => { s.processing = false; s.error = payload; })

      .addCase(createRazorpayOrder.pending,   (s)       => { s.processing = true;  s.error = null; })
      .addCase(createRazorpayOrder.fulfilled, (s, { payload }) => { s.processing = false; s.razorpayOrder = payload; })
      .addCase(createRazorpayOrder.rejected,  (s, { payload }) => { s.processing = false; s.error = payload; })

      .addCase(verifyRazorpayPayment.pending,   (s)       => { s.processing = true; })
      .addCase(verifyRazorpayPayment.fulfilled, (s, { payload }) => {
        s.processing     = false;
        s.paymentResult  = payload;
        s.successMessage = "Payment successful!";
      })
      .addCase(verifyRazorpayPayment.rejected,  (s, { payload }) => { s.processing = false; s.error = payload; })

      .addCase(recordRazorpayFailure.pending,   (s) => { s.processing = true; })
      .addCase(recordRazorpayFailure.fulfilled, (s) => { s.processing = false; })
      .addCase(recordRazorpayFailure.rejected,  (s) => { s.processing = false; });
  },
});

export const { setSelectedMethod, clearPaymentMessages, resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;