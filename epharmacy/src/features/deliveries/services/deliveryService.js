import api from "../../../api";

export const getAllDeliveries = (page = 0, size = 10) =>
  api.get("/deliveries", { params: { page, size } }).then((r) => r.data);

export const getDeliveryStats = () =>
  api.get("/deliveries/stats").then((r) => r.data);

export const patchDeliveryStatus = (deliveryId, status) =>
  api
    .patch(`/deliveries/${deliveryId}/status`, null, { params: { status } })
    .then((r) => r.data);