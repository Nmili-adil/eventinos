import { notificationApi } from "@/lib/apiNotification"
import { getAuthToken } from "@/services/localStorage";

export const fetchNotifications = async () => {
    try {
    const response = await notificationApi.get('/notifications', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
        return response;
    } catch (error) {
        console.log(error)
        throw error;
    }
}   