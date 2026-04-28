import api from "../../../api";

export const getAllDeliveries = (page = 0, size = 10, search = "", status = "", date = "") => {
  const params = new URLSearchParams({ page, size });
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (date)   params.append("date", date);
  return api.get(`/deliveries?${params}`).then((r) => r.data);
};
export const getDeliveryStats = () =>
  api.get("/deliveries/stats").then((r) => r.data);

export const patchDeliveryStatus = (deliveryId, status) =>
  api
    .patch(`/deliveries/${deliveryId}/status`, null, { params: { status } })
    .then((r) => r.data);