import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

interface DateRangeParams {
  startDate?: string
  endDate?: string
}

export const fetchEventParticipantsApi = async (eventId: string, page?: number, limit?: number) => {
    let id = eventId
    return api.get(`/guests/event-members/${id}`, {
      params: {
        ...(page && { page }),
        ...(limit && { limit })
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
  }

export const fetchMemberParticipationsApi = async (memberId: string) => {
  return api.get(`/guests/participate/${memberId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}

