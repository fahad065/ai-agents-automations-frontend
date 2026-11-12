import { api } from "./api";

export const dashboardApi = {
  // Agents
  getAgents: async () => {
    const res = await api.get("/agents");
    return res.data;
  },

  createAgent: async (data: any) => {
    const res = await api.post("/agents", data);
    return res.data;
  },

  toggleAgent: async (id: string) => {
    const res = await api.patch(`/agents/${id}/toggle`);
    return res.data;
  },

  deleteAgent: async (id: string) => {
    const res = await api.delete(`/agents/${id}`);
    return res.data;
  },

  updateAgent: async (id: string, data: any) => {
    const res = await api.patch(`/agents/${id}`, data);
    return res.data;
  },

  // Templates
  getTemplates: async () => {
    const res = await api.get("/modules?moduleType=agent");
    return res.data;
  },

  // API Keys
  getApiKeys: async () => {
    const res = await api.get("/api-keys");
    return res.data;
  },

  saveApiKey: async (data: {
    provider: string;
    label: string;
    key: string;
  }) => {
    const res = await api.post("/api-keys", data);
    return res.data;
  },

  deleteApiKey: async (id: string) => {
    const res = await api.delete(`/api-keys/${id}`);
    return res.data;
  },

  testApiKey: async (provider: string) => {
    const res = await api.get(`/api-keys/test/${provider}`);
    return res.data;
  },

  // User profile
  updateProfile: async (data: { name?: string; avatar?: string }) => {
    const res = await api.patch("/users/profile", data);
    return res.data;
  },

  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const res = await api.patch("/users/change-password", data);
    return res.data;
  },
};