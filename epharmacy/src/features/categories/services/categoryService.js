import axios from "axios";

import api from "../../../api";

 
export const getAllCategories = () =>
  api.get("/categories").then((r) => r.data); 

 
export const getCategoryById = (id) =>
  api.get(`/categories/${id}`).then((r) => r.data);




export const getMedicinesByCategory = (categorySlug) => {
  return api
    .get(`/medicines/by-category/${categorySlug}`)
    .then((res) => res.data);
};