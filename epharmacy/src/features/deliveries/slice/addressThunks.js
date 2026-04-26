import { createAsyncThunk } from "@reduxjs/toolkit";
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