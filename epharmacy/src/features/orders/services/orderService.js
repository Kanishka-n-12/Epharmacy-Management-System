
import api from "../../../api";

const orderService = {

  getOrders: () => api.get("/orders").then((r) => r.data),

  getOrder: (id) => api.get(`/orders/${id}`).then((r) => r.data),

 
  placeOrder: (addressId) =>
    api.post("/orders", null, { params: { addressId } }).then((r) => r.data),


  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`).then((r) => r.data),

 
  getInvoice: (id) => api.get(`/orders/${id}/invoice`).then((r) => r.data),
};

export default orderService;