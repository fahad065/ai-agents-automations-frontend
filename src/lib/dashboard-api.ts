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
    const res = await api.get("/agents/templates");
    return res.data;
  },

  // Trends
  discoverTrend: async (agentId: string, niche: string) => {
    const res = await api.post("/trends/discover", { agentId, niche });
    return res.data;
  },

  // Content ideas
  generateIdea: async (agentId: string, topic: string, trendId?: string) => {
    const res = await api.post("/content-ideas/generate", {
      agentId, topic, trendId,
    });
    return res.data;
  },

  getIdeas: async (agentId: string) => {
    const res = await api.get(`/content-ideas/${agentId}`);
    return res.data;
  },

  runPipeline: async (ideaId: string) => {
    const res = await api.post(`/content-ideas/${ideaId}/run-pipeline`);
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