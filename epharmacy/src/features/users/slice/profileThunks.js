import { createAsyncThunk } from "@reduxjs/toolkit";
import profileService from "../services/profileService";

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