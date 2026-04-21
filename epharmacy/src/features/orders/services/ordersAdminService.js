import api from "../../../api";

export const getAllOrdersAdmin = () =>
  api.get("/admin/orders/all-orders").then((r) => r.data);

export const getOrderStatsAdmin = () =>
  api.get("/admin/orders/stats").then((r) => r.data);

export const updateOrderStatusAdmin = (id, status) =>
  api
    .patch(`/admin/orders/${id}/status`, null, { params: { status } })
    .then((r) => r.data);