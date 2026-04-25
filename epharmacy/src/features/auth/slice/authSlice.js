import { createSlice } from "@reduxjs/toolkit";
import { getRole, getPhone, isAuthenticated } from "../services/authService";
import {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
} from "./authThunks";

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
      // ── Login ──
      .addCase(login.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.isAuthenticated = true;
        state.role            = payload.role;
        state.phone           = payload.phone;
      })
      .addCase(login.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      // ── Register ──
      .addCase(register.pending,   (state) => { state.loading = true;  state.error = null; state.success = null; })
      .addCase(register.fulfilled, (state) => { state.loading = false; state.success = "Registration successful! Please login."; })
      .addCase(register.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; state.success = null; })

      // ── Forgot Password ──
      .addCase(forgotPassword.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(forgotPassword.fulfilled, (state, { payload }) => { state.loading = false; state.success = payload; })
      .addCase(forgotPassword.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      // ── Reset Password ──
      .addCase(resetPassword.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(resetPassword.fulfilled, (state, { payload }) => { state.loading = false; state.success = payload; })
      .addCase(resetPassword.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      // ── Logout ──
      .addCase(logout.pending,   (state) => { state.loading = true; })
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