import axios from "axios";

import api from "../../../api";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const paymentService = {
  getBillSummary: (orderId) =>
    api.get(`/payments/bill-summary/${orderId}`).then((r) => r.data),

  makePayment: (dto) =>
    api.post("/payments", dto).then((r) => r.data),

  createRazorpayOrder: (dto) =>
    api.post("/payments/razorpay/create-order", dto).then((r) => r.data),

  verifyRazorpayPayment: (dto) =>
    api.post("/payments/razorpay/verify", dto).then((r) => r.data),
};