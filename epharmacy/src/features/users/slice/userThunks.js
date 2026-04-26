import { createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../services/userService";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({ page = 0, size = 10 } = {}, thunkAPI) => {
    try {
      return await userService.fetchAll(page, size);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, thunkAPI) => {
    try {
      return await userService.create(userData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, thunkAPI) => {
    try {
      return await userService.update(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async ({ id, currentStatus }, thunkAPI) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await userService.setStatus(id, newStatus);
      return { id, newStatus };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  "users/fetchUserStats",
  async (_, thunkAPI) => {
    try {
      return await userService.fetchStats();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);