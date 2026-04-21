// features/users/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../services/userService";

/* ─────────────────────────────────────────
   THUNKS
───────────────────────────────────────── */
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, thunkAPI) => {
    try {
      return await userService.fetchAll();
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

/* ─────────────────────────────────────────
   SLICE
───────────────────────────────────────── */
const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ── fetchUsers ── */
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ── createUser ── */
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })

      /* ── updateUser ── */
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex(
          (u) => u.userId === action.payload.userId
        );
        if (idx !== -1) state.users[idx] = action.payload;
      })

      /* ── toggleUserStatus ── */
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { id, newStatus } = action.payload;
        const user = state.users.find((u) => u.userId === id);
        if (user) user.status = newStatus;
      });
  },
});

export default userSlice.reducer;