import axios from 'axios';

// Create a custom axios instance pointing to our Node backend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// ── Request interceptor ──
// Automatically attach the JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stockenza_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale credentials
      localStorage.removeItem('stockenza_token');
      localStorage.removeItem('stockenza_user');

      // Only redirect if we're in the browser and not already on an auth page
      if (typeof window !== 'undefined') {
        const isAuthPage =
          window.location.pathname === '/login' ||
          window.location.pathname === '/register';

        if (!isAuthPage) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;