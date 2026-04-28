import api from "../../../api";


export const getAllPrescriptionsAdmin = () =>
  api.get("/admin/prescriptions").then((r) => r.data);


export const getPrescriptionStatsAdmin = () =>
  api.get("/admin/prescriptions/stats").then((r) => r.data);


export const updatePrescriptionStatusAdmin = (id, status) =>
  api
    .patch(`/admin/prescriptions/${id}/status`, null, { params: { status } })
    .then((r) => r.data);