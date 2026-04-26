import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotifications,
  getNotificationCount,
  markNotificationRead,
  getSentNotifications,
  sendNotification,
  broadcastNotification as broadcastApi,
} from "../services/notificationService";

export const broadcastNotification = createAsyncThunk(
  "notifications/broadcast",
  async (data, { rejectWithValue }) => {
    try {
      return await broadcastApi(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getNotifications();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchNotificationCount = createAsyncThunk(
  "notifications/fetchCount",
  async (_, { rejectWithValue }) => {
    try {
      return await getNotificationCount();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await markNotificationRead(id);
      dispatch(fetchNotificationCount());
      if (data && typeof data === "object") return data;
      return { id, status: "READ" };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchSentNotifications = createAsyncThunk(
  "notifications/fetchSent",
  async (_, { rejectWithValue }) => {
    try {
      return await getSentNotifications();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createNotification = createAsyncThunk(
  "notifications/create",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await sendNotification(data, id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);