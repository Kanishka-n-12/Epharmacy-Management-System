import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllAddressesAPI,
  fetchAddressByTypeAPI,
  createAddressAPI,
  updateAddressAPI,
  deleteAddressAPI,
  selectAddressAPI,
} from "../services/addressService";


export const fetchAddresses = createAsyncThunk(
  "address/fetchAll",
  async (type = null, { rejectWithValue }) => {
    try {
      const data = type
        ? await fetchAddressByTypeAPI(type)
        : await fetchAllAddressesAPI();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load addresses");
    }
  }
);

export const createAddress = createAsyncThunk(
  "address/create",
  async (dto, { rejectWithValue }) => {
    try {
      return await createAddressAPI(dto);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create address");
    }
  }
);

export const updateAddress = createAsyncThunk(
  "address/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      return await updateAddressAPI(id, dto);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update address");
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAddressAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete address");
    }
  }
);

export const selectAddress = createAsyncThunk(
  "address/select",
  async (id, { rejectWithValue }) => {
    try {
      await selectAddressAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to select address");
    }
  }
);


const initialState = {
  addresses: [],
  loading: false,
  submitting: false,
  error: null,
  successMessage: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearAddressMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createAddress.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.submitting = false;
        state.addresses.push(action.payload);
        state.successMessage = "Address added successfully!";
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateAddress.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.submitting = false;
        const idx = state.addresses.findIndex(
          (a) => a.addressId === action.payload.addressId
        );
        if (idx !== -1) state.addresses[idx] = action.payload;
        state.successMessage = "Address updated successfully!";
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });

    
    builder
      .addCase(deleteAddress.pending, (state) => {
        state.submitting = true;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.submitting = false;
        state.addresses = state.addresses.filter(
          (a) => a.addressId !== action.payload
        );
        state.successMessage = "Address removed.";
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });

    
    builder
      .addCase(selectAddress.pending, (state) => {
        state.submitting = true;
      })
      .addCase(selectAddress.fulfilled, (state, action) => {
        state.submitting = false;
        state.addresses = state.addresses.map((a) => ({
          ...a,
          isSelected: a.addressId === action.payload,
        }));
      })
      .addCase(selectAddress.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearAddressMessages } = addressSlice.actions;
export default addressSlice.reducer;