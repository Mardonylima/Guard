// src/api/client.js
import axios from "axios";

// Detecta se está em ambiente de produção ou desenvolvimento
const isProduction = process.env.NODE_ENV === 'production';

// Define a baseURL baseada no ambiente
const baseURL = isProduction 
  ? 'https://guard-api-4s4f.onrender.com'  // URL da sua API no Render
  : 'http://localhost:8001';               // URL local para desenvolvimento

// cria a instância do axios
const api = axios.create({
  baseURL: baseURL,
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