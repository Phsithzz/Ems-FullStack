import axios from "axios";
import { getAuthToken } from "./AuthService";

const REST_API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:8080/api/employees";

// Add Axios Request Interceptor to automatically attach Bearer token
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const listEmployees = () => axios.get(REST_API_BASE_URL);

export const createEmployee = (employee) =>
  axios.post(REST_API_BASE_URL, employee);

export const getEmployee = (employeeId) =>
  axios.get(`${REST_API_BASE_URL}/${employeeId}`);

export const updateEmployee = (employeeId, employee) =>
  axios.put(`${REST_API_BASE_URL}/${employeeId}`, employee);

export const deleteEmployee = (employeeId) =>
  axios.delete(`${REST_API_BASE_URL}/${employeeId}`);
