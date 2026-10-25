import { create } from "zustand";
import { getAuthUser, logoutApi } from "../services/AuthService";

export const useAuthStore = create((set) => ({
  user: getAuthUser(),
  isAuthenticated: !!getAuthUser(),

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  logout: async () => {
    await logoutApi();
    set({ user: null, isAuthenticated: false });
  },
}));
