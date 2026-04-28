import api from "../../../api";

export const getAllOrdersAdmin = (page = 0, size = 10, search = "", orderStatus = "", paymentStatus = "", date = "") => {
  const params = new URLSearchParams({ page, size });
  if (search)        params.append("search", search);
  if (orderStatus)   params.append("orderStatus", orderStatus);
  if (paymentStatus) params.append("paymentStatus", paymentStatus);
  if (date)          params.append("date", date);
  return api.get(`/admin/orders/all-orders?${params}`).then((r) => r.data);
};
export const getOrderStatsAdmin = () =>
  api.get("/admin/orders/stats").then((r) => r.data);

export const updateOrderStatusAdmin = (id, status) =>
  api
    .patch(`/admin/orders/${id}/status`, null, { params: { status } })
    .then((r) => r.data);