import api from "../../../api";

export const getAllPaymentsAdmin = () =>
  api.get("/payments").then((r) => r.data);


export const getPaymentStatsAdmin = () =>
  api.get("/admin/payments/stats").then((r) => r.data);


export const updatePaymentStatusAdmin = (id, status) =>
  api
    .patch(`/admin/payments/${id}/status`, null, { params: { status } })
    .then((r) => r.data);