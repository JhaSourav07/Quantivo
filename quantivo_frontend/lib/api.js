import axios from 'axios';

// Create a custom axios instance pointing to our Node backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Intercept requests to automatically add the JWT token if we have one
api.interceptors.request.use((config) => {
  // We store the token in the browser's local storage after login
  const token = localStorage.getItem('quantivo_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;