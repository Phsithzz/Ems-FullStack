import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee,
} from "../services/EmployeeService";

export const EMPLOYEE_QUERY_KEYS = {
  all: ["employees"],
  detail: (id) => ["employees", id],
};

export const useEmployees = () => {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.all,
    queryFn: async () => {
      const res = await listEmployees();
      return res.data || [];
    },
  });
};

export const useEmployee = (id) => {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const res = await getEmployee(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.all });
    },
  });
};

export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateEmployee(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.detail(variables.id) });
    },
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.all });
    },
  });
};
