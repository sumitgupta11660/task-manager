import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Skip refresh for auth routes
const SKIP_REFRESH = ["/auth/login", "/auth/register", "/auth/refresh-token", "/auth/me"];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Skip if it's an auth route or already retried
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !SKIP_REFRESH.some((path) => original.url?.includes(path))
    ) {
      original._retry = true;
      try {
        await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        return api(original);
      } catch {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;