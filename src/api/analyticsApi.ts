import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

interface AnalyticsParams {
  startDate?: string
  endDate?: string
}

export const fetchAnalyticsByCity = async (params: AnalyticsParams = {}) => {
  return api.get('/analytics/breakdown-by-city', {
    params,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}

export const fetchAnalyticsByDates = async (params: AnalyticsParams = {}) => {
  return api.get('/analytics/event-per-date', {
    params,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}

export const fetchAnalyticsByGender = async (params: AnalyticsParams = {}) => {
    return api.get('/analytics/breakdown-by-gender', {
      params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
}


export const fetchCountApi = async (params: AnalyticsParams = {}) => {
  return api.get('/analytics/counts', {
    params,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}