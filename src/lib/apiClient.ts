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
    const authData = JSON.parse(token)
    if (authData.state.token) {
      config.headers.Authorization = `Bearer ${authData.state.token}`
    }
  }
  return config
})