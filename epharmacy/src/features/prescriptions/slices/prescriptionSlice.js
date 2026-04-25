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

/**
 * Sends a file to the backend for OCR scanning.
 * On success, stores the OcrResultDTO in state.ocrResult so the
 * UploadPrescriptionModal can pre-fill the review form.
 */
export const scanPrescription = createAsyncThunk(
  "userPrescriptions/scan",
  async (file, thunkAPI) => {
    try {
      return await prescriptionService.scanPrescription(file);
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

    /** OCR scan state */
    scanning: false,
    ocrResult: null,   // OcrResultDTO from backend
    scanError: null,

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
    /** Reset OCR state when the modal is closed */
    clearOcrResult(state) {
      state.ocrResult = null;
      state.scanError = null;
      state.scanning = false;
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

      /* ── scanPrescription ── */
      .addCase(scanPrescription.pending, (state) => {
        state.scanning = true;
        state.ocrResult = null;
        state.scanError = null;
      })
      .addCase(scanPrescription.fulfilled, (state, action) => {
        state.scanning = false;
        state.ocrResult = action.payload;
      })
      .addCase(scanPrescription.rejected, (state, action) => {
        state.scanning = false;
        state.scanError =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "OCR scan failed.";
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
        state.ocrResult = null; // clear after successful submit
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
  clearOcrResult,
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;