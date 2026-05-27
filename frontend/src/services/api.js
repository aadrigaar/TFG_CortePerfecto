import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "cortePerfectoToken";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 70000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);

      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  me: () => api.get("/auth/me")
};

export const chatApi = {
  send: (payload) => api.post("/chat", payload)
};

export const appointmentApi = {
  list: (params = {}) => api.get("/appointments", { params }),
  stats: () => api.get("/appointments/stats"),
  create: (payload) => api.post("/appointments", payload),
  update: (id, payload) => api.patch(`/appointments/${id}`, payload),
  remove: (id) => api.delete(`/appointments/${id}`)
};
