import { fetchEvents } from "@/api/eventsApi";
import { FETCH_EVENTS_FAILURE, FETCH_EVENTS_REQUEST, FETCH_EVENTS_SUCCESS, type FetchEventsFailureAction, type FetchEventsRequestAction, type FetchEventsSuccessAction } from "./events.type"

export const fetchEventsRequest = (): FetchEventsRequestAction => {
    return async (dispatch: any) => {
      dispatch({ type: FETCH_EVENTS_REQUEST })
      try {
        const response = await fetchEvents()
        if(response.status ===200) {
          dispatch(fetchEventsSuccess(response.data.data, response.data.count))
        } else {
          dispatch(fetchEventsFailure(response.data.message))
        }
      } catch (error: any) {
        dispatch(fetchEventsFailure(error.response?.data?.message || error.message || 'Fetch events failed'))
      }
    };
    
}
export const fetchEventsSuccess = (events: any[], count: number): FetchEventsSuccessAction => ({
  type: FETCH_EVENTS_SUCCESS,
  count: count,
  payload: events,
})

export const fetchEventsFailure = (error: string): FetchEventsFailureAction => ({
  type: FETCH_EVENTS_FAILURE,
  payload: error,
})
