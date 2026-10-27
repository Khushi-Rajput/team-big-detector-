import { apiClient } from "./client";
import { mockDashboard } from "@/mock/dashboard";
import { mockDelay } from "@/mock/_helpers";

export const dashboardApi = {
  get: async () => {
    try {
      const res = await apiClient.get("/dashboard");
      if (res.data) return res.data;
    } catch {
      // fallback
    }
    await mockDelay();
    return mockDashboard;
  },
};
