import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect to login
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       if (typeof window !== "undefined") {
//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("refreshToken");
//         window.location.href = "/auth/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        // Get userId from persisted auth store
        let userId = "";
        const authData = localStorage.getItem("kt-auth");
        if (authData) {
          try {
            const parsed = JSON.parse(authData);
            userId = parsed?.state?.user?._id || parsed?.state?.user?.id || "";
          } catch {}
        }

        if (!refreshToken || !userId) throw new Error("No refresh credentials");

        const res = await axios.post(`${API_URL}/auth/refresh`, {
          userId,
          refreshToken,
        });

        const newToken = res.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        if (res.data.refreshToken) {
          localStorage.setItem("refreshToken", res.data.refreshToken);
        }
        document.cookie = `accessToken=${newToken}; path=/; max-age=7200`;

        // Retry original request with new token
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api(error.config);
      } catch {
        localStorage.clear();
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;