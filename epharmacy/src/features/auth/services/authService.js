
import axios from "axios";
import { store } from "../../../store";
import { clearAuth } from "../slice/authSlice";
import api from "../../../api";
import {jwtDecode} from "jwt-decode"

const base = "/auth";


function saveTokens({ accessToken, refreshToken, phone }) {
  localStorage.setItem("accessToken",  accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("phone",        phone);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("phone");
  localStorage.removeItem("role");
}

export function getRoleFromToken(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch (error) {
    return null;
  }
}

export const getAccessToken  = () => localStorage.getItem("accessToken");
export const getRole         = () => localStorage.getItem("role");
export const getPhone        = () => localStorage.getItem("phone");
export const isAuthenticated = () => !!localStorage.getItem("accessToken");


export async function loginApi({ phone, password }) {
  const { data } = await api.post(base + "/login", { phone, password });
  const role = getRoleFromToken(data.accessToken);
  saveTokens(data);
  localStorage.setItem("role", role);
  return { ...data, role };
}

export async function registerApi({ phone, password, name, email }) {
  const { data } = await api.post(base + "/register", { phone, password, name, email });
  return data;
}

export async function logoutApi() {
  try {
    await api.post(base + "/logout");
  } finally {
    clearTokens();
  }
}

export async function forgotPasswordApi(phone) {
  const { data } = await api.post(base + "/forgot-password", { phone });
  return data;
}

export async function resetPasswordApi({ phone, otp, newPassword }) {
  const { data } = await api.post(base + "/reset-password", { phone, otp, newPassword });
  return data;
}