import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPrescriptions,
  fetchPrescriptionStats,
  updatePrescriptionStatus,
} from "./prescriptionAdminThunks";

function runValidation(p) {
  const checks = [];
  let valid = true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasDoctor = !!(p.doctorName?.trim());
  checks.push({ label: "Doctor name present", pass: hasDoctor });
  if (!hasDoctor) valid = false;

  const hasRegId = !!(p.doctorRegisteredId?.trim());
  checks.push({ label: "Doctor registered ID present", pass: hasRegId });
  if (!hasRegId) valid = false;

  const hasFile = !!(p.filePath?.trim());
  checks.push({ label: "Prescription file attached", pass: hasFile });
  if (!hasFile) valid = false;

  const rawDate = p.prescribedDate ?? p.uploadedDate;
  if (!rawDate) {
    checks.push({ label: "Prescribed date present", pass: false });
    return { valid: false, checks, reason: "Prescribed date is missing." };
  }
  checks.push({ label: "Prescribed date present", pass: true });

  const prescribed = new Date(rawDate);
  prescribed.setHours(0, 0, 0, 0);

  const notFuture = prescribed <= today;
  checks.push({ label: "Prescribed date is not a future date", pass: notFuture });
  if (!notFuture) valid = false;

  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const notOld = prescribed >= oneMonthAgo;
  checks.push({ label: "Prescription within 1-month validity", pass: notOld });
  if (!notOld) valid = false;

  const reason = valid
    ? "All validations passed."
    : !notFuture
    ? "Prescribed date cannot be a future date."
    : !notOld
    ? "Prescription is older than 1 month and cannot be approved."
    : !hasDoctor || !hasRegId
    ? "Required doctor details are missing."
    : !hasFile
    ? "Prescription file is missing."
    : "This prescription cannot be approved.";

  return { valid, checks, reason };
}

const prescriptionAdminSlice = createSlice({
  name: "prescriptions",
  initialState: {
    prescriptions: [],
    stats:         { total: 0, approved: 0, pending: 0, rejected: 0 },
    loading:       false,
    error:         null,
    adminLoading:  false,
    adminError:    null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptions.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchPrescriptions.fulfilled, (state, { payload }) => {
        state.loading       = false;
        state.prescriptions = (payload || []).map((p) => ({ ...p, _validation: runValidation(p) }));
      })
      .addCase(fetchPrescriptions.rejected,  (state, { payload, error }) => { state.loading = false; state.error = payload ?? error.message; })

      .addCase(fetchPrescriptionStats.pending,   (state) => { state.adminLoading = true;  state.adminError = null; })
      .addCase(fetchPrescriptionStats.fulfilled, (state, { payload }) => {
        state.adminLoading = false;
        state.stats = {
          total:    payload.total    ?? 0,
          approved: payload.approved ?? 0,
          pending:  payload.pending  ?? 0,
          rejected: payload.rejected ?? 0,
        };
      })
      .addCase(fetchPrescriptionStats.rejected,  (state, { payload, error }) => { state.adminLoading = false; state.adminError = payload ?? error.message; })

      .addCase(updatePrescriptionStatus.pending,   (state) => { state.adminLoading = true;  state.adminError = null; })
      .addCase(updatePrescriptionStatus.fulfilled, (state, { payload }) => {
        state.adminLoading = false;
        const { id, status } = payload;
        const item = state.prescriptions.find((p) => p.prescriptionId === id);
        if (item) item.approvalStatus = status;
        state.stats.approved = state.prescriptions.filter((p) => (p.approvalStatus || "").toLowerCase() === "approved").length;
        state.stats.pending  = state.prescriptions.filter((p) => (p.approvalStatus || "").toLowerCase() === "pending").length;
        state.stats.rejected = state.prescriptions.filter((p) => (p.approvalStatus || "").toLowerCase() === "rejected").length;
        state.stats.total    = state.prescriptions.length;
      })
      .addCase(updatePrescriptionStatus.rejected,  (state, { payload, error }) => { state.adminLoading = false; state.adminError = payload ?? error.message; });
  },
});

export default prescriptionAdminSlice.reducer;