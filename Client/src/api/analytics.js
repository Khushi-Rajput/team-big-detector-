import { apiClient } from "./client";
import { mockInsights, mockAllVersions, mockHistory } from "@/mock/analytics";
import { mockDelay } from "@/mock/_helpers";

export const analyticsApi = {
  insights: async () => {
    try {
      const res = await apiClient.get("/insights");
      if (res.data) return res.data;
    } catch {
      // fallback
    }
    await mockDelay();
    return mockInsights;
  },

  versions: async () => {
    try {
      const res = await apiClient.get("/versions");
      if (res.data) return res.data;
    } catch {
      // fallback
    }
    await mockDelay();
    return mockAllVersions;
  },

  history: async () => {
    try {
      const res = await apiClient.get("/history");
      if (res.data) return res.data;
    } catch {
      // fallback
    }
    await mockDelay();
    return mockHistory;
  },
};
