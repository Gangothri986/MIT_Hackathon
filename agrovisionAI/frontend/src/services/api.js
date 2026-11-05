// import axios from 'axios';

// // Backend API URL defaults to /api (proxied via Vite to http://localhost:5000 in dev)
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// export const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to inject Authorization token if available
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('agrovision_auth_token') || sessionStorage.getItem('agrovision_auth_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Helper to check backend health
// export const checkBackendHealth = async () => {
//   try {
//     const res = await apiClient.get('/health', { timeout: 2500 });
//     return res.data?.status === 'online';
//   } catch {
//     return false;
//   }
// };

// // Check if running in offline demo mode when backend is unreachable
// export const isDemoMode = () => {
//   return localStorage.getItem('agrovision_force_backend') !== 'true';
// };

// export const setDemoMode = () => {};

import axios from 'axios';

// Backend API URL defaults to /api (proxied via Vite to http://localhost:5000 in development)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Allow enough time for Gemini image analysis
});

// Request interceptor to inject Authorization token if available
apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('agrovision_auth_token') ||
      sessionStorage.getItem('agrovision_auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to check backend health
export const checkBackendHealth = async () => {
  try {
    const res = await apiClient.get('/health', { timeout: 5000 });
    return res.data?.status === 'online';
  } catch {
    return false;
  }
};

// Check if running in offline demo mode when backend is unreachable
export const isDemoMode = () => {
  return localStorage.getItem('agrovision_force_backend') !== 'true';
};

export const setDemoMode = () => {};
