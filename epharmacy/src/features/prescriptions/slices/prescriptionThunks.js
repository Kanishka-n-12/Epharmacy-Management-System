import { createAsyncThunk } from "@reduxjs/toolkit";
import prescriptionService from "../services/prescriptionService";

export const fetchPrescriptions = createAsyncThunk(
  "userPrescriptions/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await prescriptionService.getPrescriptions();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const fetchPrescription = createAsyncThunk(
  "userPrescriptions/fetchOne",
  async (id, thunkAPI) => {
    try {
      return await prescriptionService.getPrescription(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const scanPrescription = createAsyncThunk(
  "userPrescriptions/scan",
  async (file, thunkAPI) => {
    try {
      return await prescriptionService.scanPrescription(file);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const uploadPrescription = createAsyncThunk(
  "userPrescriptions/upload",
  async (dto, thunkAPI) => {
    try {
      return await prescriptionService.uploadPrescription(dto);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const deletePrescription = createAsyncThunk(
  "userPrescriptions/delete",
  async (id, thunkAPI) => {
    try {
      await prescriptionService.deletePrescription(id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);