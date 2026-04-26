import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  selectAddress,
} from "./addressThunks";

const initialState = {
  addresses:      [],
  loading:        false,
  submitting:     false,
  error:          null,
  successMessage: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearAddressMessages(state) {
      state.error          = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchAddresses.fulfilled, (state, { payload }) => { state.loading = false; state.addresses = payload; })
      .addCase(fetchAddresses.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      .addCase(createAddress.pending,   (state) => { state.submitting = true;  state.error = null; })
      .addCase(createAddress.fulfilled, (state, { payload }) => {
        state.submitting     = false;
        state.addresses.push(payload);
        state.successMessage = "Address added successfully!";
      })
      .addCase(createAddress.rejected,  (state, { payload }) => { state.submitting = false; state.error = payload; })

      .addCase(updateAddress.pending,   (state) => { state.submitting = true;  state.error = null; })
      .addCase(updateAddress.fulfilled, (state, { payload }) => {
        state.submitting     = false;
        const idx = state.addresses.findIndex((a) => a.addressId === payload.addressId);
        if (idx !== -1) state.addresses[idx] = payload;
        state.successMessage = "Address updated successfully!";
      })
      .addCase(updateAddress.rejected,  (state, { payload }) => { state.submitting = false; state.error = payload; })

      .addCase(deleteAddress.pending,   (state) => { state.submitting = true; })
      .addCase(deleteAddress.fulfilled, (state, { payload }) => {
        state.submitting     = false;
        state.addresses      = state.addresses.filter((a) => a.addressId !== payload);
        state.successMessage = "Address removed.";
      })
      .addCase(deleteAddress.rejected,  (state, { payload }) => { state.submitting = false; state.error = payload; })

      .addCase(selectAddress.pending,   (state) => { state.submitting = true; })
      .addCase(selectAddress.fulfilled, (state, { payload }) => {
        state.submitting = false;
        state.addresses  = state.addresses.map((a) => ({
          ...a,
          isSelected: a.addressId === payload,
        }));
      })
      .addCase(selectAddress.rejected,  (state, { payload }) => { state.submitting = false; state.error = payload; });
  },
});

export const { clearAddressMessages } = addressSlice.actions;
export default addressSlice.reducer;