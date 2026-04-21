// features/profile/slice/profileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import profileService from "../services/profileService";

/* ─────────────────────────────────────────
   THUNKS
───────────────────────────────────────── */

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, thunkAPI) => {
    try {
      return await profileService.getProfile();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (data, thunkAPI) => {
    try {
      return await profileService.updateProfile(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const updateProfilePhoto = createAsyncThunk(
  "profile/updateProfilePhoto",
  async (imageUrl, thunkAPI) => {
    try {
      await profileService.updatePhoto(imageUrl);
      return imageUrl;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

/* ─────────────────────────────────────────
   SLICE
───────────────────────────────────────── */
const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profile: null,    // UserResponseDTO fields
    loading: false,
    updating: false,
    error: null,
    successMsg: null,
  },
  reducers: {
    clearProfileMessages(state) {
      state.error = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ── fetchProfile ── */
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ── updateProfile ── */
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.successMsg = "Profile updated successfully!";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      /* ── updateProfilePhoto ── */
      .addCase(updateProfilePhoto.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.imageUrl = action.payload;
        }
      });
  },
});

export const { clearProfileMessages } = profileSlice.actions;
export default profileSlice.reducer;