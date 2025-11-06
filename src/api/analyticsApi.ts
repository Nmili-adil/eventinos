import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

export const fetchAnalyticsByCity = async () => {
  return api.get('/analytics/breakdown-by-city', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}

export const fetchAnalyticsByDates = async () => {
  return api.get('analytics/events-per-dates', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}

export const fetchAnalyticsByGender = async () => {
    return api.get('/analytics/breakdown-by-gender', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
}


export const fetchCountApi = async () => {
  return api.get('/analytics/counts', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}