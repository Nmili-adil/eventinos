import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

export interface NotificationItem {
  _id: string
  title: string
  message: string
  createdAt: string
  read?: boolean
  type?: string
  meta?: Record<string, any>
}

export interface NotificationsResponse {
  data: NotificationItem[]
}

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
})

export const fetchNotificationsApi = async () => {
  return await api.get<NotificationsResponse>('/firebase-notifications/stats', {
    headers: authHeaders(),
  })
}



export const markNotificationReadApi = async (notificationId: string) => {
  return api.put(`/notifications/${notificationId}/view`, {}, { headers: authHeaders() })
}

export const markAllNotificationsReadApi = async () => {
  return api.put('/notifications/view', {}, { headers: authHeaders() })
}