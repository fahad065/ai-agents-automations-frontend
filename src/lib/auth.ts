import { api } from "./api";

export interface LoginResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    avatar?: string;
    provider: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  googleCallback: async (token: string, refresh: string) => {
    return { accessToken: token, refreshToken: refresh };
  },
};