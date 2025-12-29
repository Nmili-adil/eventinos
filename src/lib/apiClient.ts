import axios from 'axios'

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Check environment - use VITE_APP_ENV from .env file, fallback to MODE
const isDevelopment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === 'development'

export const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  // Only log in development
  if (isDevelopment) {
    console.error('Request Error:', error);
  }
  return Promise.reject(error);
})

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only log detailed errors in development
    if (isDevelopment) {
      console.error('API Error:', {
        message: error.message,
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
    }

    // Handle 500 errors globally by dispatching a custom event
    if (error.response?.status >= 500 && error.response?.status < 600) {
      if (isDevelopment) {
        console.error('Server Error (500+):', {
          status: error.response?.status,
          message: error.response?.data?.message,
          url: error.config?.url,
        });
      }

      // Dispatch a custom event that will be caught by the global error handler
      // In production, we don't include detailed error info
      window.dispatchEvent(new CustomEvent('server-error', {
        detail: {
          status: error.response?.status,
          message: isDevelopment ? (error.response?.data?.message || 'Internal Server Error') : 'Internal Server Error',
          error: isDevelopment ? error : null
        }
      }));
    }

    return Promise.reject(error);
  }
)