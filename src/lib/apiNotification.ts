import { getAuthToken } from "@/services/localStorage";
import axios from "axios";


const notificationApiUrl = import.meta.env.VITE_NOTIFICATION_API_URL || "http://localhost:3000";

export const notificationApi = axios.create({
    baseURL: notificationApiUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

notificationApi.interceptors.request.use((config) => {
    const token = getAuthToken()
        if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
})