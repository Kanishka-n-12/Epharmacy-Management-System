// features/prescriptions/slices/prescriptionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import prescriptionService from "../services/prescriptionService";

/* ─────────────────────────────────────────
   THUNKS
───────────────────────────────────────── */

export const fetchPrescriptions = createAsyncThunk(
  "userPrescriptions/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await prescriptionService.getPrescriptions();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const fetchPrescription = createAsyncThunk(
  "userPrescriptions/fetchOne",
  async (id, thunkAPI) => {
    try {
      return await prescriptionService.getPrescription(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const uploadPrescription = createAsyncThunk(
  "userPrescriptions/upload",
  async (dto, thunkAPI) => {
    try {
      return await prescriptionService.uploadPrescription(dto);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const deletePrescription = createAsyncThunk(
  "userPrescriptions/delete",
  async (id, thunkAPI) => {
    try {
      await prescriptionService.deletePrescription(id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

/* ─────────────────────────────────────────
   SLICE
───────────────────────────────────────── */
const prescriptionSlice = createSlice({
  name: "userPrescriptions",
  initialState: {
    prescriptions: [],
    selectedPrescription: null,
    loading: false,
    detailLoading: false,
    uploading: false,
    deleting: false,
    error: null,
    uploadError: null,
    uploadSuccess: null,
    deleteError: null,
    deleteSuccess: null,
  },
  reducers: {
    clearSelectedPrescription(state) {
      state.selectedPrescription = null;
    },
    clearUploadMessages(state) {
      state.uploadError = null;
      state.uploadSuccess = null;
    },
    clearDeleteMessages(state) {
      state.deleteError = null;
      state.deleteSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ── fetchPrescriptions ── */
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ── fetchPrescription (single) ── */
      .addCase(fetchPrescription.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchPrescription.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedPrescription = action.payload;
      })
      .addCase(fetchPrescription.rejected, (state) => {
        state.detailLoading = false;
      })

      /* ── uploadPrescription ── */
      .addCase(uploadPrescription.pending, (state) => {
        state.uploading = true;
        state.uploadError = null;
        state.uploadSuccess = null;
      })
      .addCase(uploadPrescription.fulfilled, (state, action) => {
        state.uploading = false;
        state.prescriptions.unshift(action.payload);
        state.uploadSuccess = "Prescription uploaded successfully!";
      })
      .addCase(uploadPrescription.rejected, (state, action) => {
        state.uploading = false;
        state.uploadError = action.payload;
      })

      /* ── deletePrescription ── */
      .addCase(deletePrescription.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deletePrescription.fulfilled, (state, action) => {
        state.deleting = false;
        const id = action.payload;
        state.prescriptions = state.prescriptions.filter(
          (p) => p.prescriptionId !== id
        );
        if (state.selectedPrescription?.prescriptionId === id) {
          state.selectedPrescription = null;
        }
        state.deleteSuccess = "Prescription deleted successfully.";
      })
      .addCase(deletePrescription.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload;
      });
  },
});

export const {
  clearSelectedPrescription,
  clearUploadMessages,
  clearDeleteMessages,
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;