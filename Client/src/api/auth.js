import { apiClient } from "./client";
import { mockUser, loadMockUser, saveMockUser } from "@/mock/auth";
import { mockDelay } from "@/mock/_helpers";

export const authApi = {
  register: async (payload) => {
    try {
      const res = await apiClient.post("/auth/register", payload);
      if (res.data?.user) {
        saveMockUser(res.data.user);
        return res.data;
      }
    } catch (err) {
      if (err.status && err.status !== 502 && err.status !== 504 && err.status !== 0) {
        throw err;
      }
    }
    await mockDelay();
    const u = { ...mockUser, name: payload.name || mockUser.name, email: payload.email || mockUser.email };
    saveMockUser(u);
    return { user: u };
  },

  login: async (credentials) => {
    try {
      const res = await apiClient.post("/auth/login", credentials);
      if (res.data?.user) {
        saveMockUser(res.data.user);
        return res.data;
      }
    } catch (err) {
      if (err.status && err.status !== 502 && err.status !== 504 && err.status !== 0) {
        throw err;
      }
    }
    await mockDelay();
    const u = { ...mockUser, email: credentials.email || mockUser.email };
    saveMockUser(u);
    return { user: u };
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore
    }
    saveMockUser(null);
    return { ok: true };
  },

  me: async () => {
    try {
      const res = await apiClient.get("/auth/me");
      if (res.data?.user) {
        saveMockUser(res.data.user);
        return res.data;
      }
    } catch (err) {
      if (err.status === 401) {
        saveMockUser(null);
        throw err;
      }
    }
    const u = loadMockUser();
    if (!u) {
      throw { status: 401, message: "Not authenticated" };
    }
    return { user: u };
  },

  updateProfile: async (payload) => {
    try {
      const res = await apiClient.patch("/auth/profile", payload);
      if (res.data?.user) {
        saveMockUser(res.data.user);
        return res.data;
      }
    } catch {
      // fallback
    }
    await mockDelay();
    const current = loadMockUser() || mockUser;
    const u = { ...current, ...payload };
    saveMockUser(u);
    return { user: u };
  },

  changePassword: async (payload) => {
    try {
      return (await apiClient.patch("/auth/password", payload)).data;
    } catch {
      await mockDelay();
      return { ok: true };
    }
  },
};
