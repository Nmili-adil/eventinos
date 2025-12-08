import axios from 'axios'

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";


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
  console.error('❌ Request Error:', error);
  return Promise.reject(error);
})

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    // Handle 500 errors globally
    if (error.response?.status >= 500 && error.response?.status < 600) {
      // Create a custom error with server error flag
      const serverError = new Error(error.response?.data?.message || 'Internal Server Error');
      (serverError as any).isServerError = true;
      (serverError as any).status = error.response?.status;
      (serverError as any).originalError = error;
      
      // Log to console for debugging
      console.error('🚨 Server Error (500+):', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url,
      });

      return Promise.reject(serverError);
    }

    return Promise.reject(error);
  }
)