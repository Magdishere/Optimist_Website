import axios from 'axios';

const API_URL = 'https://optimist-backend-api.onrender.com';

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

// Interceptor to add JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const BASE_URL = API_URL;

export default API;
