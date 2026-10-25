import axios from "axios";

const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL || "http://localhost:8080/api/auth";

export const loginApi = (email, password) => {
  return axios.post(`${AUTH_API_BASE_URL}/login`, { email, password });
};

export const verifyOtpApi = (email, otpCode) => {
  return axios.post(`${AUTH_API_BASE_URL}/verify-otp`, { email, otpCode });
};

export const resendOtpApi = (email) => {
  return axios.post(`${AUTH_API_BASE_URL}/resend-otp?email=${encodeURIComponent(email)}`);
};

export const registerApi = (name, email, password, role) => {
  return axios.post(`${AUTH_API_BASE_URL}/register`, { name, email, password, role });
};

// Token Storage Utilities
export const setAuthData = (token, email, name, role) => {
  localStorage.setItem("binance_ems_token", token);
  localStorage.setItem("binance_ems_user", JSON.stringify({ email, name, role }));
};

export const getAuthToken = () => {
  return localStorage.getItem("binance_ems_token");
};

export const getAuthUser = () => {
  const userStr = localStorage.getItem("binance_ems_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("binance_ems_token");
  localStorage.removeItem("binance_ems_user");
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
