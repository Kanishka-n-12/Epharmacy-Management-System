import axios from "axios";
import api from "../../../api";

const BASE_URL = "http://localhost:8080/api/addresses";

export const fetchAllAddressesAPI = async () => {
  const { data } = await api.get(BASE_URL);
  return data;
};

export const fetchAddressByTypeAPI = async (type) => {
  const { data } = await api.get(BASE_URL, { params: { type } });
  return data;
};

export const fetchAddressByIdAPI = async (id) => {
  const { data } = await api.get(`${BASE_URL}/${id}`);
  return data;
};

export const createAddressAPI = async (dto) => {
  const { data } = await api.post(BASE_URL, dto);
  return data;
};

export const updateAddressAPI = async (id, dto) => {
  const { data } = await api.put(`${BASE_URL}/${id}`, dto);
  return data;
};

export const deleteAddressAPI = async (id) => {
  await api.delete(`${BASE_URL}/${id}`);
};

export const selectAddressAPI = async (id) => {
  await api.patch(`${BASE_URL}/${id}/select`);
};

