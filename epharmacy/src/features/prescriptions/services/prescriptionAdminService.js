import api from "../../../api";

/** GET /admin/prescriptions */
export const getAllPrescriptionsAdmin = () =>
  api.get("/admin/prescriptions").then((r) => r.data);

/** GET /admin/prescriptions/stats */
export const getPrescriptionStatsAdmin = () =>
  api.get("/admin/prescriptions/stats").then((r) => r.data);

/** PATCH /admin/prescriptions/:id/status?status=approved|rejected|pending */
export const updatePrescriptionStatusAdmin = (id, status) =>
  api
    .patch(`/admin/prescriptions/${id}/status`, null, { params: { status } })
    .then((r) => r.data);