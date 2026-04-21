import api from "../../../api";

export const getAllDeliveries = () =>
  api.get("/deliveries").then((r) => r.data);
 
export const getDeliveryStats = () =>
  api.get("/deliveries/stats").then((r) => r.data);
 
export const patchDeliveryStatus = (deliveryId, status) =>
  api
    .patch(`/deliveries/${deliveryId}/status`, null, { params: { status } })
    .then((r) => r.data);