
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginApi,
  registerApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
  getRole,
  getPhone,
  isAuthenticated,
} from "../services/authService";


function extractError(err, fallback) {
  const data = err.response?.data;
  if (!data)                 return err.message || fallback;
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
      return await forgotPasswordApi(phone);
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to send OTP"));
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ phone, otp, newPassword }, { rejectWithValue }) => {
    try {
      return await resetPasswordApi({ phone, otp, newPassword });
    } catch (err) {
      return rejectWithValue(extractError(err, "Password reset failed"));
    }
  }
);


const initialState = {
  isAuthenticated: isAuthenticated(),
  role:    getRole(),
  phone:   getPhone(),
  loading: false,
  error:   null,
  success: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, { payload }) {
      state.isAuthenticated = true;
      state.role  = payload.role;
      state.phone = payload.phone;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.role    = null;
      state.phone   = null;
      state.loading = false;
      state.error   = null;
    },
    clearMessages(state) {
      state.error   = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.isAuthenticated = true;
        state.role            = payload.role;
        state.phone           = payload.phone;
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload; 
      })

      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error   = null;
        state.success = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.success = "Registration successful! Please login.";
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
        state.success = null;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(forgotPassword.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = payload;
      })
      .addCase(forgotPassword.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(resetPassword.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = payload;
      })
      .addCase(resetPassword.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      })

      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading         = false;
        state.isAuthenticated = false;
        state.role            = null;
        state.phone           = null;
        state.error           = null;
        state.success         = null;
      })
      .addCase(logout.rejected, (state, { payload }) => {
        state.loading         = false;
        state.isAuthenticated = false;
        state.role            = null;
        state.phone           = null;
        state.error           = payload;
      });
  },
});

export const { setAuth, clearAuth, clearMessages } = authSlice.actions;
export default authSlice.reducer;