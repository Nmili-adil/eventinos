import { fetchAnalyticsByCity, fetchAnalyticsByDates, fetchAnalyticsByGender, fetchCountApi } from "@/api/analyticsApi";
import { 
  FETCH_ANALYTICS_FAILURE, 
  FETCH_ANALYTICS_REQUEST, 
  FETCH_ANALYTICS_SUCCESS, 
  type FetchAnalyticsFailureAction,
  type FetchAnalyticsSuccessAction 
} from "./analytics.types";

export const fetchAnalyticsRequest = () => {
  return async (dispatch: any) => {
    dispatch({ type: FETCH_ANALYTICS_REQUEST })
    try {
      const [responseCity, responseGender, responseDates, responseCount] = await Promise.all([
        fetchAnalyticsByCity(),
        fetchAnalyticsByGender(),
        fetchAnalyticsByDates(),
        fetchCountApi()
      ])

      console.log('Analytics API Responses:', {
        city: { status: responseCity.status, data: responseCity.data },
        gender: { status: responseGender.status, data: responseGender.data },
        dates: { status: responseDates.status, data: responseDates.data },
        count: { status: responseCount.status, data: responseCount.data }
      })

      if(responseCity.status === 200 && responseGender.status === 200 && responseDates.status === 200 && responseCount.status === 200) {
        dispatch(fetchAnalyticsSuccess({
          byCity: responseCity.data.data,
          byGender: responseGender.data.data,
          byDates: responseDates.data.data
        }))
      } else {
        const errorMsg = responseCity.data?.message || 
          responseGender.data?.message || 
          responseDates.data?.message || 
          responseCount.data?.message || 
          'Fetch analytics failed'
        console.error('Analytics fetch failed with status codes:', {
          city: responseCity.status,
          gender: responseGender.status,
          dates: responseDates.status,
          count: responseCount.status
        })
        dispatch(fetchAnalyticsFailure(errorMsg))
      }
    } catch (error: any) {
      console.error('Analytics fetch error:', error)
      dispatch(fetchAnalyticsFailure(error.response?.data?.message || error.message || 'Fetch analytics failed'))
    }
  }
}

const fetchAnalyticsSuccess = (data: {
  byCity?: any;
  byGender?: any;
  byDates?: any;
}): FetchAnalyticsSuccessAction => ({
  type: FETCH_ANALYTICS_SUCCESS,
  payload: data,
})

const fetchAnalyticsFailure = (error: string): FetchAnalyticsFailureAction => ({
  type: FETCH_ANALYTICS_FAILURE,
  payload: error,
})