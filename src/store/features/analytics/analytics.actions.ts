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
      const [responseCity, responseGender, responseDates] = await Promise.all([
        fetchAnalyticsByCity(),
        fetchAnalyticsByGender(),
        fetchAnalyticsByDates(),
        fetchCountApi()
      ])

      if(responseCity.status === 200 && responseGender.status === 200 && responseDates.status != null) {
        dispatch(fetchAnalyticsSuccess({
          byCity: responseCity.data.data,
          byGender: responseGender.data.data,
          byDates: responseDates.data.data
        }))
      } else {
        dispatch(fetchAnalyticsFailure(
          responseCity.data?.message || 
          responseGender.data?.message || 
          responseDates.data?.message || 
          'Fetch analytics failed'
        ))
      }
    } catch (error: any) {
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