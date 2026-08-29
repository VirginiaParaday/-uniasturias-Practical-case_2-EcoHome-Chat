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

export async function signupRequest({ username, email, password }) {
  const { data } = await api.post('/auth/signup', { username, email, password });
  return data; // { token, user }
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function getMyStats() {
  const { data } = await api.get('/users/me/stats');
  return data; // { username, productsCount }
}

export async function getProducts() {
  const { data } = await api.get('/products');
  return data.products;
}

export async function createProduct({ name, description, price }) {
  const { data } = await api.post('/products', { name, description, price });
  return data; // { product, productsCount }
}

export async function updateProduct(id, { name, description, price }) {
  const { data } = await api.put(`/products/${id}`, { name, description, price });
  return data; // { product }
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data; // { ok, id, productsCount }
}

export async function getRecentMessages() {
  const { data } = await api.get('/messages/recent');
  return data.messages;
}

export default api;
