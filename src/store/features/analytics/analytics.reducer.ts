import type { AnalyticsType, AnalyticsActionTypes } from "./analytics.types"

const initialState: AnalyticsType = {
  statistics: {
    byCity: null,
    byGender: null,
    byDates: null,
  },
  isLoading: false,
  error: null,
}

const analyticsReducer = (state = initialState, action: AnalyticsActionTypes): AnalyticsType => {
  switch (action.type) {
    case 'FETCH_ANALYTICS_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'FETCH_ANALYTICS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        statistics: {
          ...state.statistics,
          ...action.payload,
        },
        error: null,
      }
    case 'FETCH_ANALYTICS_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export default analyticsReducer