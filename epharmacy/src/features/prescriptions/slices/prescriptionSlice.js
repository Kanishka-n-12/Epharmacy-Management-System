import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPrescriptions,
  fetchPrescription,
  scanPrescription,
  uploadPrescription,
  deletePrescription,
} from "./prescriptionThunks";

const prescriptionSlice = createSlice({
  name: "userPrescriptions",
  initialState: {
    prescriptions:        [],
    selectedPrescription: null,
    loading:              false,
    detailLoading:        false,
    uploading:            false,
    deleting:             false,
    scanning:             false,
    ocrResult:            null,
    scanError:            null,
    error:                null,
    uploadError:          null,
    uploadSuccess:        null,
    deleteError:          null,
    deleteSuccess:        null,
  },
  reducers: {
    clearSelectedPrescription(state) { state.selectedPrescription = null; },
    clearUploadMessages(state)       { state.uploadError = null; state.uploadSuccess = null; },
    clearDeleteMessages(state)       { state.deleteError = null; state.deleteSuccess = null; },
    clearOcrResult(state)            { state.ocrResult = null; state.scanError = null; state.scanning = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptions.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchPrescriptions.fulfilled, (state, { payload }) => { state.loading = false; state.prescriptions = payload; })
      .addCase(fetchPrescriptions.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      .addCase(fetchPrescription.pending,   (state) => { state.detailLoading = true; })
      .addCase(fetchPrescription.fulfilled, (state, { payload }) => { state.detailLoading = false; state.selectedPrescription = payload; })
      .addCase(fetchPrescription.rejected,  (state) => { state.detailLoading = false; })

      .addCase(scanPrescription.pending,   (state) => { state.scanning = true;  state.ocrResult = null; state.scanError = null; })
      .addCase(scanPrescription.fulfilled, (state, { payload }) => { state.scanning = false; state.ocrResult = payload; })
      .addCase(scanPrescription.rejected,  (state, { payload }) => {
        state.scanning  = false;
        state.scanError = typeof payload === "string" ? payload : payload?.message || "OCR scan failed.";
      })

      .addCase(uploadPrescription.pending,   (state) => { state.uploading = true;  state.uploadError = null; state.uploadSuccess = null; })
      .addCase(uploadPrescription.fulfilled, (state, { payload }) => {
        state.uploading      = false;
        state.ocrResult      = null;
        state.uploadSuccess  = "Prescription uploaded successfully!";
        state.prescriptions.unshift(payload);
      })
      .addCase(uploadPrescription.rejected,  (state, { payload }) => { state.uploading = false; state.uploadError = payload; })

      .addCase(deletePrescription.pending,   (state) => { state.deleting = true;  state.deleteError = null; state.deleteSuccess = null; })
      .addCase(deletePrescription.fulfilled, (state, { payload }) => {
        state.deleting       = false;
        state.deleteSuccess  = "Prescription deleted successfully.";
        state.prescriptions  = state.prescriptions.filter((p) => p.prescriptionId !== payload);
        if (state.selectedPrescription?.prescriptionId === payload) state.selectedPrescription = null;
      })
      .addCase(deletePrescription.rejected,  (state, { payload }) => { state.deleting = false; state.deleteError = payload; });
  },
});

export const {
  clearSelectedPrescription,
  clearUploadMessages,
  clearDeleteMessages,
  clearOcrResult,
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;