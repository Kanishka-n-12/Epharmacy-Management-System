import { createSlice } from "@reduxjs/toolkit";
import {
  fetchUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  fetchUserStats,
} from "./userThunks";

const userSlice = createSlice({
  name: "users",
  initialState: {
    users:         [],
    totalPages:    1,
    totalElements: 0,
    stats:         null,
    pageStats:     null,
    loading:       false,
    error:         null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.loading        = false;
        state.users          = payload.content       || [];
        state.totalPages     = payload.totalPages;
        state.totalElements  = payload.totalElements;
        state.pageStats      = payload.pageStats;
      })
      .addCase(fetchUsers.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      .addCase(fetchUserStats.fulfilled,  (state, { payload }) => { state.stats = payload; })

      .addCase(createUser.fulfilled,      (state, { payload }) => { state.users.push(payload); })

      .addCase(updateUser.fulfilled,      (state, { payload }) => {
        const idx = state.users.findIndex((u) => u.userId === payload.userId);
        if (idx !== -1) state.users[idx] = payload;
      })

      .addCase(toggleUserStatus.fulfilled, (state, { payload }) => {
        const { id, newStatus } = payload;
        const user = state.users.find((u) => u.userId === id);
        if (user) user.status = newStatus;
      });
  },
});

export default userSlice.reducer;