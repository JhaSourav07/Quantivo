import axios from 'axios';

// Create a custom axios instance pointing to our Node backend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
});

// Intercept requests to automatically add the JWT token if we have one
api.interceptors.request.use((config) => {
  // We store the token in the browser's local storage after login
  const token = localStorage.getItem('stockenza_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;