import axios from 'axios';

const api = axios.create({
  baseURL: 'https://kalam-backend-plyr.onrender.com',
});

// Auto-attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        const res = await axios.post('http://127.0.0.1:8000/api/auth/refresh/', { refresh });
        localStorage.setItem('access_token', res.data.access);
        error.config.headers.Authorization = `Bearer ${res.data.access}`;
        return axios(error.config);
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (username, password) =>
  api.post('/api/auth/login/', { username, password });

export const register = (username, email, password) =>
  api.post('/api/auth/register/', { username, email, password });

export const getMe = () => api.get('/api/auth/me/');

// Poems
export const getPoems = () => api.get('/api/poems/');
export const getPoem = (id) => api.get(`/api/poems/${id}/`);
export const createPoem = (data) => api.post('/api/poems/', data);
export const updatePoem = (id, data) => api.put(`/api/poems/${id}/`, data);
export const deletePoem = (id) => api.delete(`/api/poems/${id}/`);
export const analyzePoem = (text) => api.post('/api/analyze/', { text });
export const getSuggestions = (word, poem_text) => api.post('/api/suggest/complete/', { word, poem_text });

export default api;