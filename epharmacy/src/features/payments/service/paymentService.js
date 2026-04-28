import axios from "axios";

import api from "../../../api";

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
export async function getInvoice(orderId) {
    const { data } = await api.get(`/payments/invoice/${orderId}`);
    return data;
}

export async function recordFailedPayment(dto) {
    const { data } = await api.post("/payments/razorpay/failure", dto);
    return data;
}