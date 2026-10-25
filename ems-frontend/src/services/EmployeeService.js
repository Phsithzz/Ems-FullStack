import apiClient from "./apiClient";

export const listEmployees = () => apiClient.get("/employees");

export const createEmployee = (employee) => apiClient.post("/employees", employee);

export const getEmployee = (employeeId) => apiClient.get(`/employees/${employeeId}`);

export const updateEmployee = (employeeId, employee) =>
  apiClient.put(`/employees/${employeeId}`, employee);

export const deleteEmployee = (employeeId) =>
  apiClient.delete(`/employees/${employeeId}`);
