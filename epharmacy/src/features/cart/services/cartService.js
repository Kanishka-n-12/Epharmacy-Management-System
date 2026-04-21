import axios from "axios";

import api from "../../../api";

const base = "/cart";

export const getCartApi        = ()                         => api.get(base).then(r => r.data);
export const getCartSummaryApi = ()                         => api.get(base+"/summary").then(r => r.data);
export const getCartCountApi   = ()                         => api.get(base+"/count").then(r => r.data);
export const addToCartApi      = (medicineId, quantity)     => {
    console.log(medicineId);
    console.log(quantity);
    return api.post(base, { medicineId, quantity }).then(r => r.data);
}
export const placeOrderApi = (addressId) =>
  api.post(`/orders?addressId=${addressId}`).then((r) => r.data);
export const updateQtyApi      = (medicineId, quantity)     => api.put(`${base}/${medicineId}`, { quantity }).then(r => r.data);
export const removeItemApi     = (medicineId)               => api.delete(`${base}/${medicineId}`).then(r => r.data);
export const saveForLaterApi   = (medicineId)               => api.post(`${base}/${medicineId}/save-for-later`).then(r => r.data);
export const moveToCartApi     = (medicineId)               => api.post(`${base}/${medicineId}/move-to-cart`).then(r => r.data);
export const deleteSavedApi    = (medicineId)               => api.delete(`${base}/saved/${medicineId}`).then(r => r.data);