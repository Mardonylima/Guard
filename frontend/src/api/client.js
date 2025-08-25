// src/api/client.js
import axios from "axios";

// cria a instância do axios
const api = axios.create({
  baseURL: "http://localhost:8001", // FastApi
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de request → adiciona token se existir
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // pegando do localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response → se der 401, redireciona para login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token"); // limpa token inválido
      window.location.href = "/login"; // redireciona para login
    }
    return Promise.reject(error);
  }
);

export default api;