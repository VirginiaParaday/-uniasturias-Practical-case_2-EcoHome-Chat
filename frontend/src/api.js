import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL: API_URL });

// Adjunta automaticamente el token JWT guardado (Actividad 3, Entregable 1).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecohome_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginRequest(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  return data; // { token, user }
}

export async function getRecentMessages() {
  const { data } = await api.get('/messages/recent');
  return data.messages;
}

export default api;
