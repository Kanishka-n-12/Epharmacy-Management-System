import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProfile,
  updateProfile,
  updateProfilePhoto,
} from "./profileThunks";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profile:    null,
    loading:    false,
    updating:   false,
    error:      null,
    successMsg: null,
  },
  reducers: {
    clearProfileMessages(state) {
      state.error      = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchProfile.fulfilled, (state, { payload }) => { state.loading = false; state.profile = payload; })
      .addCase(fetchProfile.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      .addCase(updateProfile.pending,   (state) => { state.updating = true;  state.error = null; state.successMsg = null; })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.updating    = false;
        state.profile     = payload;
        state.successMsg  = "Profile updated successfully!";
      })
      .addCase(updateProfile.rejected,  (state, { payload }) => { state.updating = false; state.error = payload; })

      .addCase(updateProfilePhoto.fulfilled, (state, { payload }) => {
        if (state.profile) state.profile.imageUrl = payload;
      });
  },
});

export const { clearProfileMessages } = profileSlice.actions;
export default profileSlice.reducer;