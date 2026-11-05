
import axios from 'axios';

// ======================================================
// BACKEND API CONFIGURATION
// ======================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    Accept: 'application/json',
  },
});

// ======================================================
// AUTHENTICATION TOKEN
// ======================================================

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

// ======================================================
// RESPONSE ERROR HANDLING
// ======================================================

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      console.error(
        'Backend API Error:',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error(
        'Backend server is not responding:',
        error.message
      );
    } else {
      console.error('API request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ======================================================
// BACKEND HEALTH CHECK
// ======================================================

export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/health', {
      timeout: 5000,
    });

    return response.data?.status === 'online';
  } catch (error) {
    console.error('Backend health check failed:', error.message);
    return false;
  }
};

// ======================================================
// IMAGE URL HELPER
// ======================================================

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('blob:')
  ) {
    return imageUrl;
  }

  const backendOrigin =
    import.meta.env.VITE_BACKEND_URL ||
    'http://127.0.0.1:5000';

  return `${backendOrigin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};
