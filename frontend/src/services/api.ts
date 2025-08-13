import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://192.168.0.144:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to appropriate login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Try to determine user type from stored user data
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.role === 'provider') {
            window.location.href = '/provider/login';
          } else {
            window.location.href = '/patient/login';
          }
        } catch {
          // Default to patient login if user data is corrupted
          window.location.href = '/patient/login';
        }
      } else {
        // Default to patient login if no user data
        window.location.href = '/patient/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 