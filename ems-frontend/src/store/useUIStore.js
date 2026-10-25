import { create } from "zustand";

export const useUIStore = create((set) => ({
  isSidebarCollapsed: localStorage.getItem("workpay_sidebar_collapsed") === "true",

  toggleSidebar: () =>
    set((state) => {
      const next = !state.isSidebarCollapsed;
      localStorage.setItem("workpay_sidebar_collapsed", String(next));
      return { isSidebarCollapsed: next };
    }),

  setSidebarCollapsed: (collapsed) => {
    localStorage.setItem("workpay_sidebar_collapsed", String(collapsed));
    set({ isSidebarCollapsed: collapsed });
  },
}));
