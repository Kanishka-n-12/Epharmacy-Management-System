import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginApi,
  registerApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
} from "../services/authService";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (!data)                    return err.message || fallback;
  if (typeof data === "string") return data || fallback;
  return data.message || data.error || fallback;
}

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginApi(credentials);
    } catch (err) {
      return rejectWithValue(extractError(err, "Invalid credentials"));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      return await registerApi(data);
    } catch (err) {
      return rejectWithValue(extractError(err, "Registration failed"));
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch (err) {
      return rejectWithValue(extractError(err, "Logout failed"));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (phone, { rejectWithValue }) => {
    try {
      const data = await forgotPasswordApi(phone);
      return data?.message || "OTP sent successfully.";
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to send OTP"));
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ phone, otp, newPassword }, { rejectWithValue }) => {
    try {
      const data = await resetPasswordApi({ phone, otp, newPassword });
      return data?.message || "Password reset successfully.";
    } catch (err) {
      return rejectWithValue(extractError(err, "Password reset failed"));
    }
  }
);