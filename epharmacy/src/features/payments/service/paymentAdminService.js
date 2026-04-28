import api from "../../../api";

export const getAllPaymentsAdmin = (page = 0, size = 10, search = "", status = "", method = "", date = "") => {
  const params = new URLSearchParams({ page, size });
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (method) params.append("method", method);
  if (date)   params.append("date", date);
  return api.get(`/admin/payments?${params}`).then((r) => r.data);
};
export const getPaymentStatsAdmin = () =>
  api.get("/admin/payments/stats").then((r) => r.data);


export const updatePaymentStatusAdmin = (id, status) =>
  api
    .patch(`/admin/payments/${id}/status`, null, { params: { status } })
    .then((r) => r.data);