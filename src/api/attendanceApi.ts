import { api } from "@/lib/apiClient"

export interface AttendanceQuery {
  page?: number
  limit?: number
  present?: boolean
  search?: string
}

export const fetchEventAttendanceApi = async (eventId: string, query: AttendanceQuery) => {
  const response = await api.get(`/events/${eventId}/attendance`, {
    params: query,
    skipServerErrorPage: true,
  })
  return response.data
}

export const fetchEventAttendanceStatsApi = async (eventId: string) => {
  const response = await api.get(`/events/${eventId}/attendance/stats`, {
    skipServerErrorPage: true,
  })
  return response.data?.data ?? response.data
}

export const fetchGuestScansApi = async (eventId: string, guestId: string) => {
  const response = await api.get(`/events/${eventId}/attendance/${guestId}/scans`, {
    skipServerErrorPage: true,
  })
  const data = response.data?.data ?? response.data
  return Array.isArray(data) ? data : []
}
